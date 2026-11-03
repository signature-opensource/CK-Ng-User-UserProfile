using CK.AppIdentity;
using CK.Core;
using CK.Cris;
using CK.DB.Actor.ActorEMail;
using CK.DB.User.UserPassword;
using CK.IO.UserProfile.UserPassword.Lost;
using CK.SqlServer;
using CK.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Shouldly;
using static CK.Testing.MonitorTestHelper;
using PasswordLostQueries = CK.UserProfile.UserPassword.Lost.PasswordLostQueries;
using PasswordLostTokenService = CK.UserProfile.UserPassword.Lost.PasswordLostTokenService;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The server side of the lost password flow, without the browser: the recovery token is single use without storage
/// (it is bound to the password it was issued for), and the recovery mail goes only to a validated primary address.
/// </summary>
[TestFixture]
public class PasswordLostTokenTests
{
    AutomaticServices _services;

    [OneTimeSetUp]
    public async Task SetupAsync()
    {
        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();
        configuration.FirstBinPath.AddAuthCenterApplication();
        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.DB.User.UserPassword",
                                                          "CK.DB.Actor.ActorEMail",
                                                          "CK.DB.User.NamedUser",
                                                          "CK.Mailer.MailKit",
                                                          "CK.UserProfile.UserPassword.Lost" ] );
        configuration.FirstBinPath.Types.Add( typeof( TestClientApplication ) );
        var engineRes = await configuration.RunSuccessfullyAsync();

        var appIdentity = ApplicationIdentityServiceConfiguration.Create( TestHelper.Monitor, c =>
        {
            c["FullName"] = "Test/$PasswordLostToken";
            c["Local:AllowFeatures"] = "AuthCenter";
            c["Local:PublicUrl"] = "https://front.example.com";
            // The recovery sends a confirmation mail: it is dropped in a pickup directory.
            c["Local:EmailSender:Smtp:UsePickupDirectory"] = "true";
            c["Local:EmailSender:Smtp:PickupDirectory"] = TestHelper.TestProjectFolder.Combine( "obj/MailPickupToken" ).Path;
            c["Local:EmailSender:Smtp:SendEmail"] = "false";
            c["Local:EmailSender:Smtp:RequiredAuthentication"] = "false";
        } );
        Throw.CheckState( appIdentity != null );
        _services = engineRes.CreateAutomaticServices( configureServices: services =>
        {
            services.AddSingleton( appIdentity );
            services.AddDataProtection();
        } );
        // The mail sender is a feature of the party: the identity service must be started.
        await _services.Services.GetRequiredService<ApplicationIdentityService>().StartAndInitializeAsync();
    }

    [OneTimeTearDown]
    public async Task TeardownAsync()
    {
        if( _services.Services != null ) await _services.DisposeAsync();
    }

    [Test]
    public async Task a_recovery_token_dies_with_its_first_use_and_with_any_password_change_Async()
    {
        using var scope = _services.Services.CreateScope();
        using var ctx = new SqlStandardCallContext();
        var services = scope.ServiceProvider;
        var pocoDir = services.GetRequiredService<PocoDirectory>();
        var executor = services.GetRequiredService<CrisBackgroundExecutor>();
        var userTable = services.GetRequiredService<DB.Actor.UserTable>();
        var pwdTable = services.GetRequiredService<UserPasswordTable>();
        var tokenService = services.GetRequiredService<PasswordLostTokenService>();
        var queries = services.GetRequiredService<PasswordLostQueries>();

        var userId = await userTable.CreateUserAsync( ctx, 1, $"PasswordLostToken-{Guid.NewGuid():N}" );
        await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "initial", DB.Auth.UCLMode.CreateOrUpdate );

        // The commands are executed without caller party (0: the local party, its PartyActorId is not known here).
        async Task<string> IssueTokenAsync( int partyId = 0 ) => tokenService.CreateToken( userId, (await queries.GetPasswordHashAsync( ctx, userId ))!, partyId );

        async Task<bool> RecoverAsync( string token, string password )
        {
            var cmd = pocoDir.Create<IRecoverPasswordCommand>( c =>
            {
                c.Token = token;
                c.Password = password;
            } );
            var result = await executor.Submit( TestHelper.Monitor, cmd, incomingValidationCheck: false )
                                       .WithResult<ICrisBasicCommandResult>()
                                       .Result;
            return result.Success;
        }

        // The first use recovers the password; the same link is then dead.
        var token = await IssueTokenAsync();
        (await RecoverAsync( token, "recovered" )).ShouldBeTrue();
        (await pwdTable.LoginUserAsync( ctx, userId, "recovered" )).IsSuccess.ShouldBeTrue();
        (await RecoverAsync( token, "attacker" )).ShouldBeFalse( "A used token is dead." );
        (await pwdTable.LoginUserAsync( ctx, userId, "recovered" )).IsSuccess.ShouldBeTrue();

        // A token issued before any other password change is dead too.
        var older = await IssueTokenAsync();
        await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "changed", DB.Auth.UCLMode.CreateOrUpdate );
        (await RecoverAsync( older, "attacker" )).ShouldBeFalse( "The password changed since the token was issued." );
        (await pwdTable.LoginUserAsync( ctx, userId, "changed" )).IsSuccess.ShouldBeTrue();

        // A token issued through another party is refused.
        (await RecoverAsync( await IssueTokenAsync( partyId: 3712 ), "attacker" )).ShouldBeFalse( "Issued through another party." );

        // A fresh token works.
        (await RecoverAsync( await IssueTokenAsync(), "final" )).ShouldBeTrue();
        (await pwdTable.LoginUserAsync( ctx, userId, "final" )).IsSuccess.ShouldBeTrue();
    }

    [Test]
    public async Task the_recovery_mail_goes_only_to_a_validated_primary_address_Async()
    {
        using var scope = _services.Services.CreateScope();
        using var ctx = new SqlStandardCallContext();
        var services = scope.ServiceProvider;
        var userTable = services.GetRequiredService<DB.Actor.UserTable>();
        var pwdTable = services.GetRequiredService<UserPasswordTable>();
        var emailTable = services.GetRequiredService<ActorEMailTable>();
        var queries = services.GetRequiredService<PasswordLostQueries>();

        var userId = await userTable.CreateUserAsync( ctx, 1, $"PasswordLostMail-{Guid.NewGuid():N}" );
        await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "initial", DB.Auth.UCLMode.CreateOrUpdate );
        var first = $"{Guid.NewGuid():N}@first.com";
        var second = $"{Guid.NewGuid():N}@second.com";

        // The only address is not validated: it is the primary one, but no recovery link is sent to it.
        await emailTable.AddEMailAsync( ctx, 1, userId, first, isPrimary: true );
        (await queries.FindPasswordUserByEmailAsync( ctx, first )).ShouldBeNull();

        // A second address is validated: it becomes the primary one (CK.DB.Actor.ActorEMail), and the recovery uses it.
        await emailTable.AddEMailAsync( ctx, 1, userId, second, isPrimary: false );
        await emailTable.ValidateEMailAsync( ctx, 1, userId, second );
        (await queries.FindPasswordUserByEmailAsync( ctx, second )).ShouldNotBeNull().UserId.ShouldBe( userId );
        (await queries.FindPasswordUserByEmailAsync( ctx, first )).ShouldBeNull( "Not the primary one, and not validated." );
    }
}
