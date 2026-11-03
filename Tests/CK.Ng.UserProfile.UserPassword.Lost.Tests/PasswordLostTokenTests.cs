using CK.AppIdentity;
using CK.Core;
using CK.Cris;
using CK.DB.User.UserPassword;
using CK.IO.UserProfile.UserPassword.Lost;
using CK.SqlServer;
using CK.Testing;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Shouldly;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

/// <summary>
/// The recovery token is single use without storage: it is bound to the password it was issued for.
/// </summary>
[TestFixture]
public class PasswordLostTokenTests
{
    [Test]
    public async Task a_recovery_token_dies_with_its_first_use_and_with_any_password_change_Async()
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
        var engineRes = await configuration.RunSuccessfullyAsync();

        var appIdentity = ApplicationIdentityServiceConfiguration.Create( TestHelper.Monitor, c =>
        {
            c["FullName"] = "Test/$PasswordLostToken";
            c["Local:AllowFeatures"] = "AuthCenter";
            // The recovery sends a confirmation mail: it is dropped in a pickup directory.
            c["Local:EmailSender:Smtp:UsePickupDirectory"] = "true";
            c["Local:EmailSender:Smtp:PickupDirectory"] = TestHelper.TestProjectFolder.Combine( "obj/MailPickupToken" ).Path;
            c["Local:EmailSender:Smtp:SendEmail"] = "false";
            c["Local:EmailSender:Smtp:RequiredAuthentication"] = "false";
        } );
        Throw.CheckState( appIdentity != null );
        var autoServices = engineRes.CreateAutomaticServices( configureServices: services =>
        {
            services.AddSingleton( appIdentity );
            services.AddDataProtection();
        } );
        // The mail sender is a feature of the party: the identity service must be started.
        await autoServices.Services.GetRequiredService<ApplicationIdentityService>().StartAndInitializeAsync();

        using var scope = autoServices.Services.CreateScope();
        using var ctx = new SqlStandardCallContext();
        var services = scope.ServiceProvider;
        var pocoDir = services.GetRequiredService<PocoDirectory>();
        var executor = services.GetRequiredService<CrisBackgroundExecutor>();
        var userTable = services.GetRequiredService<DB.Actor.UserTable>();
        var pwdTable = services.GetRequiredService<UserPasswordTable>();
        var tokenService = services.GetRequiredService<global::CK.UserProfile.UserPassword.Lost.PasswordLostTokenService>();
        var queries = services.GetRequiredService<global::CK.UserProfile.UserPassword.Lost.PasswordLostQueries>();

        var userId = await userTable.CreateUserAsync( ctx, 1, $"PasswordLostToken-{Guid.NewGuid():N}" );
        await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "initial", DB.Auth.UCLMode.CreateOrUpdate );

        async Task<string> IssueTokenAsync() => tokenService.CreateToken( userId, (await queries.GetPasswordHashAsync( ctx, userId ))! );

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

        // A fresh token works.
        (await RecoverAsync( await IssueTokenAsync(), "final" )).ShouldBeTrue();
        (await pwdTable.LoginUserAsync( ctx, userId, "final" )).IsSuccess.ShouldBeTrue();
    }
}
