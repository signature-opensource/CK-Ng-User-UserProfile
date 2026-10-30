using CK.AppIdentity;
using CK.Core;
using CK.Cris;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.DB.User.UserPasskey;
using System.Security.Cryptography;
using CK.Ng.UserProfile.UserPasskey.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserPasskey.Tests;

[TestFixture]
public class UserPasskeyTests
{
    [Test]
    public async Task CK_Ng_UserProfile_UserPasskey_Async()
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        // The application is its own AuthCenter (with its HTTP front).
        configuration.FirstBinPath.AddAuthCenterApplication();
        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.DB.User.UserPassword",
                                                          "CK.Ng.Cris.AspNet.Authentication.Basic",
                                                          // The passkey scheme family and its provider.
                                                          "CK.AppIdentity.Cris.AuthCenter.Passkey",
                                                          "CK.DB.User.UserPasskey",
                                                          "CK.Ng.UserProfile",
                                                          "CK.Ng.UserProfile.UserPasskey" ] );
        configuration.FirstBinPath.Types.Add( typeof( MyLayoutPackage ) );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( IUserProfile ) );
        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );

        var engineRes = await configuration.RunSuccessfullyAsync();

        var autoServices = engineRes.CreateAutomaticServices( configureServices: services =>
        {
            // The application is its own AuthCenter: its identity service needs its configuration.
            services.AddSingleton( ApplicationIdentityServiceConfiguration.Create( TestHelper.Monitor, AuthCenterApplicationTestingExtensions.DefaultIdentity )! );
            services.AddDataProtection();
        } );
        using( var scope = autoServices.Services.CreateScope() )
        using( var ctx = new SqlStandardCallContext() )
        {
            var services = scope.ServiceProvider;
            var userTable = services.GetRequiredService<DB.Actor.UserTable>();
            var pwdTable = services.GetRequiredService<UserPasswordTable>();
            // TestUser has a password: what is seeded below is never its last sign-in method.
            var userId = userTable.Database.ExecuteScalar<int?>( "select UserId from CK.tUser where UserName = @0", "TestUser" ).GetValueOrDefault();
            if( userId <= 0 ) userId = await userTable.CreateUserAsync( ctx, 1, "TestUser" );
            await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "success", DB.Auth.UCLMode.CreateOrUpdate );
            // One passkey (the store doesn't verify the COSE key: random bytes are fine).
            userTable.Database.ExecuteNonQuery( "delete CK.tUserPasskey where UserId = @0", userId );
            var store = services.GetRequiredService<IPasskeyStore>();
            var handle = await store.GetOrCreateUserHandleAsync( TestHelper.Monitor, userId );
            await store.CreateAsync( TestHelper.Monitor, new PasskeyCredential( RandomNumberGenerator.GetBytes( 64 ),
                                                                                         userId,
                                                                                         handle,
                                                                                         RandomNumberGenerator.GetBytes( 77 ),
                                                                                         0,
                                                                                         backupEligible: true,
                                                                                         backupState: false,
                                                                                         Guid.NewGuid(),
                                                                                         ["internal"],
                                                                                         "Seeded key" ) );
        }

        var map = engineRes.LoadMap();
        var builder = WebApplication.CreateSlimBuilder();
        // The Basic logins reach the Critical level: the section's Critical operations are tested.
        await using var server = await builder.CreateRunningAuthCenterApplicationAsync( map, c =>
        {
            AuthCenterApplicationTestingExtensions.DefaultIdentity( c );
            c["Local:AuthCenter:CriticalLifetimes:Basic"] = "00:05:00";
            c["Local:AuthCenter:Passkey:RpId"] = "localhost";
            c["Local:AuthCenter:Passkey:RpName"] = "Test";
            c["Local:AuthCenter:Passkey:Origins:0"] = "http://localhost";
        } );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );
        runner.Run();
    }
}
