using CK.Core;
using CK.Cris;
using CK.Cris.AspNet;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.Ng.UserProfile.NamedUser.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.NamedUser.Tests;

[TestFixture]
public class NgUserProfileTests
{
    [Test]
    public async Task CK_Ng_UserProfile_NamedUser_Async()
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
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.UserProfile.NamedUser" );
        configuration.FirstBinPath.Assemblies.Add( "CK.Ng.Zorro.BackOffice" );
        configuration.FirstBinPath.Assemblies.Add( "CK.SqlServer.Transaction" );

        configuration.FirstBinPath.Types.Add( typeof( CrisAspNetService ),
                                              typeof( DB.User.NamedUser.Package ),
                                              typeof( DB.User.NamedUser.NamedUserTable ),
                                              typeof( DB.Actor.UserTable ),
                                              typeof( UserPasswordTable ),
                                              typeof( CrisBackgroundExecutorService ),
                                              typeof( CrisBackgroundExecutor ),
                                              typeof( MyLayoutPackage ),
                                              typeof( TestCommandHandler ),
                                              typeof( ICreateUserCommandResult ),
                                              typeof( IO.User.NamedUser.ICreateUserCommand ),
                                              typeof( ISetUserNameCommand ),
                                              typeof( IO.User.NamedUser.ISetUserNamesCommand ),
                                              typeof( IO.User.NamedUser.IUserProfile ),
                                              typeof( IUpdateUserCommand ),
                                              typeof( IGetUserProfileQCommand ) );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IO.User.NamedUser.ISetUserNamesCommand ),
                                                                                       typeof( IO.User.NamedUser.IUserProfile ),
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( IGetUserProfileQCommand ) );

        TestHelper.Monitor.DebuggerBreakOn( "TypeScript packages structure:" );
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

            var userName = "Toto";
            var resId = userTable.Database.ExecuteScalar<int?>( "select UserId from CK.tUser where UserName = @0",
                                                                userName );
            var userId = resId.GetValueOrDefault();
            if( userId <= 0 )
            {
                var cmd = pocoDir.Create<IO.User.NamedUser.ICreateUserCommand>( c =>
                {
                    c.ActorId = 1;
                    c.UserName = userName;
                    c.FirstName = "Toto";
                    c.LastName = "Titi";
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
