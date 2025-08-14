using CK.Core;
using CK.Cris;
using CK.Cris.AspNet;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.IO.User.NamedUser;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Shouldly;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.NamedUser.Tests;

[TestFixture]
public class NamedUserTests
{
    [Test]
    public async Task CK_Ng_UserProfile_NamedUser_Async()
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        configuration.FirstBinPath.Assemblies.AddRange( [
                "CK.Cris.Auth",
                "CK.DB.AspNet.Auth",
                "CK.DB.User.UserPassword",
                "CK.DB.User.NamedUser",
                "CK.Ng.Cris.AspNet.Auth",
                "CK.Ng.AspNet.Auth.Basic",
                "CK.Ng.UserProfile",
                "CK.Ng.UserProfile.NamedUser",
                "CK.Ng.Zorro.BackOffice",
                "CK.SqlServer.Transaction"
            ] );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( ISetUserNamesCommand ),
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( IO.Actor.IUserProfile ) );

        TestHelper.Monitor.DebuggerBreakOn( "TypeScript packages structure:" );
        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );
        var engineRes = (await configuration.RunSuccessfullyAsync());


        var map = engineRes.LoadMap();

        #region Ensuring "Toto" (first name: "Toto", last name "Titi") and its password.
        var userTable = map.StObjs.Obtain<DB.Actor.UserTable>().ShouldNotBeNull();
        var pwdTable = map.StObjs.Obtain<UserPasswordTable>().ShouldNotBeNull();
        using( var ctx = new SqlStandardCallContext() )
        {
            int idUser = await userTable.FindByNameAsync( ctx, "Toto" );
            if( idUser <= 0 )
            {
                var pocoDir = map.StObjs.Obtain<PocoDirectory>().ShouldNotBeNull();
                var cmd = pocoDir.Create<IO.User.NamedUser.ICreateUserCommand>( c =>
                {
                    c.ActorId = 1;
                    c.UserName = "Toto";
                    c.FirstName = "Toto";
                    c.LastName = "Titi";
                } );
                idUser = (await userTable.CreateUserAsync( ctx, cmd )).UserIdResult;
                await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, idUser, "success", DB.Auth.UCLMode.CreateOrUpdate );
            }
        }
        #endregion
        var builder = WebApplication.CreateSlimBuilder();
        builder.AddUnsafeAllowAllCors();
        builder.AddWebFrontAuth( ao => ao.SlidingExpirationTime = TimeSpan.FromMinutes( 10 ) );
        await using var server = await builder.CreateRunningAspNetServerAsync( map, app => { app.UseMiddleware<CrisMiddleware>(); app.UseCris(); } );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );
        runner.Run();
    }
}
