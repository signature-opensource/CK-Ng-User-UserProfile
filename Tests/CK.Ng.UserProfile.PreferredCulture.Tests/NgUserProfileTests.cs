using CK.Core;
using CK.Cris;
using CK.Cris.AspNet;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.Ng.UserProfile.PreferredCulture.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.PreferredCulture.Tests;


public class NgUserProfileTests
{
    [Test]
    public async Task CK_Ng_UserProfile_PreferredCulture_Async()
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        configuration.FirstBinPath.Assemblies.Add( "CK.Cris.Auth" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.Cris.AspNet.Auth" );
        configuration.FirstBinPath.Assemblies.Add( "CK.DB.AspNet.Auth" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.AspNet.Auth.Basic" );
        configuration.FirstBinPath.Assemblies.Add( "CK.DB.User.UserPassword" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.UserProfile" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.UserProfile.PreferredCulture" );
        configuration.FirstBinPath.Assemblies.Add( "CK.DB.User.PreferredCulture" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.Zorro.BackOffice" );
        configuration.FirstBinPath.Assemblies.Add( "CK.SqlServer.Transaction" );

        configuration.FirstBinPath.Types.Add( typeof( CrisAspNetService ),
                                              typeof( DB.User.PreferredCulture.Package ),
                                              typeof( UserPasswordTable ),
                                              typeof( CrisBackgroundExecutorService ),
                                              typeof( CrisBackgroundExecutor ),
                                              typeof( MyLayoutPackage ),
                                              typeof( TestCommandHandler ),
                                              typeof( IO.User.PreferredCulture.ICreateUserCommand ),
                                              typeof( ICreateUserCommandResult ),
                                              typeof( IGetUserProfileQCommand ),
                                              typeof( IO.User.PreferredCulture.ISetUserPreferredCultureCommand ),
                                              typeof( ISetUserNameCommand ),
                                              typeof( IUpdateUserCommand ),
                                              typeof( IO.User.PreferredCulture.IUserProfile ) );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( IO.User.PreferredCulture.ISetUserPreferredCultureCommand ),
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( IO.User.PreferredCulture.IUserProfile ) );

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
        }
        #endregion

        var map = engineRes.LoadMap();
        var builder = WebApplication.CreateSlimBuilder();
        builder.AddUnsafeAllowAllCors();
        builder.AddWebFrontAuth( ao => ao.SlidingExpirationTime = TimeSpan.FromMinutes( 10 ) );
        await using var server = await builder.CreateRunningAspNetServerAsync( map, app => { app.UseMiddleware<CrisMiddleware>(); app.UseCris(); } );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );
        runner.Run();
    }
}
