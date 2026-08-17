using CK.Core;
using CK.Cris;
using CK.Cris.AspNet;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.Ng.UserProfile.UserPassword.Reset.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using System.Diagnostics;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserPassword.Reset.Tests;

[TestFixture]
public class UserPasswordResetTests
{
    [TestCase( "test" )]
    [TestCase( "ck-watch", Explicit = true )]
    public async Task CK_Ng_UserProfile_UserPassword_Reset_Async( string yarnCommand )
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.Cris.Auth",
                                                          "CK.Ng.Cris.AspNet.Auth",
                                                          "CK.DB.AspNet.Auth",
                                                          "CK.Ng.AspNet.Auth.Basic",
                                                          "CK.DB.User.UserPassword.Reset",
                                                          "CK.Ng.UserProfile",
                                                          "CK.Ng.UserProfile.UserPassword",
                                                          "CK.Ng.UserProfile.UserPassword.Reset" ] );

        // Registering the Reset extension of IUserProfile is what puts isTemporaryPassword on the
        // generated TypeScript UserProfile, which the navigation guard reads.
        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( IO.User.UserPassword.Reset.ISetPasswordCommand ),
                                                                                       typeof( IO.User.UserPassword.Reset.IUserProfile ) );

        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );
        var engineRes = (await configuration.RunSuccessfullyAsync());

        #region Ensuring TestUser and its password...
        var autoServices = engineRes.CreateAutomaticServices();
        using( var scope = autoServices.Services.CreateScope() )
        using( var ctx = new SqlStandardCallContext() )
        {
            var services = scope.ServiceProvider;
            var pocoDir = services.GetRequiredService<PocoDirectory>();
            var backgroundExecutor = services.GetRequiredService<CrisBackgroundExecutor>();
            var userTable = services.GetRequiredService<DB.Actor.UserTable>();
            var pwdTable = services.GetRequiredService<UserPasswordTable>();

            var userName = "TestUser";
            var resId = userTable.Database.ExecuteScalar<int?>( "select UserId from CK.tUser where UserName = @0",
                                                                userName );
            var userId = resId.GetValueOrDefault();
            if( userId <= 0 )
            {
                var cmd = pocoDir.Create<ICreateUserCommand>( c =>
                {
                    c.ActorId = 1;
                    c.UserName = userName;
                } );
                var executingCmd = backgroundExecutor.Submit( TestHelper.Monitor, cmd, incomingValidationCheck: false )
                                                     .WithResult<ICreateUserCommandResult>();
                var res = await executingCmd.Result;
                userId = res.UserIdResult;
            }

            await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, userId, "success", DB.Auth.UCLMode.CreateOrUpdate );
            // The TypeScript test drives the temporary flag itself, but a previous run may have left
            // it set: start from a known state.
            userTable.Database.ExecuteNonQuery( "update CK.tUserPassword set IsTemporary = 0 where UserId = @0", userId );
        }
        #endregion

        var map = engineRes.LoadMap();
        var builder = WebApplication.CreateSlimBuilder();
        builder.AddUnsafeAllowAllCors();
        builder.AddWebFrontAuth( ao => ao.SlidingExpirationTime = TimeSpan.FromMinutes( 10 ) );
        await using var server = await builder.CreateRunningAspNetServerAsync( map, app => app.UseMiddleware<CrisMiddleware>() );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );

        if( !Debugger.IsAttached && yarnCommand == "ck-watch" )
        {
            TestHelper.Monitor.Warn( $"No debugger currently attached. Changing ck-watch to test." );
            yarnCommand = "test";
        }
        runner.Run( yarnCommand );
    }
}
