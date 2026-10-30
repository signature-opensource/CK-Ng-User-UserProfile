using CK.AppIdentity;
using CK.Core;
using CK.Cris;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.DB.User.UserOidc;
using CK.Ng.UserProfile.UserOidc.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserOidc.Tests;

[TestFixture]
public class UserOidcTests
{
    [Test]
    public async Task CK_Ng_UserProfile_UserOidc_Async()
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        // The application is its own AuthCenter (with its HTTP front).
        configuration.FirstBinPath.AddAuthCenterApplication();
        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.DB.User.UserPassword",
                                                          "CK.Ng.Cris.AspNet.Authentication.Basic",
                                                          // The OpenID Connect scheme family and its provider.
                                                          "CK.AppIdentity.Cris.AuthCenter.Oidc",
                                                          "CK.DB.User.UserOidc",
                                                          "CK.Ng.UserProfile",
                                                          "CK.Ng.UserProfile.UserOidc" ] );
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
            // One identity, in the "Test" scheme of the identity configuration below.
            var oidc = services.GetRequiredService<UserOidcTable>();
            await oidc.DestroyOidcUserAsync( ctx, 1, userId, null );
            var info = services.GetRequiredService<PocoDirectory>().Create<IUserOidcInfo>( i =>
            {
                i.SchemeSuffix = "Test";
                i.Sub = "test-sub";
                i.Claims = """{"email":"test@example.com","name":"Test User"}""";
            } );
            await oidc.CreateOrUpdateOidcUserAsync( ctx, 1, userId, info );
        }

        var map = engineRes.LoadMap();
        var builder = WebApplication.CreateSlimBuilder();
        // The Basic logins reach the Critical level: the section's Critical operations are tested.
        await using var server = await builder.CreateRunningAuthCenterApplicationAsync( map, c =>
        {
            AuthCenterApplicationTestingExtensions.DefaultIdentity( c );
            c["Local:AuthCenter:CriticalLifetimes:Basic"] = "00:05:00";
            // A provider that is never reached: the section only lists the scheme.
            c["Local:AuthCenter:Oidc:Test:Authority"] = "https://idp.example.com";
            c["Local:AuthCenter:Oidc:Test:ClientId"] = "client";
            c["Local:AuthCenter:Oidc:Test:ClientSecret"] = "secret";
            c["Local:AuthCenter:Oidc:Test:CallbackUrls:0"] = "http://localhost/.auth/oidc/callback";
        } );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );
        runner.Run();
    }
}
