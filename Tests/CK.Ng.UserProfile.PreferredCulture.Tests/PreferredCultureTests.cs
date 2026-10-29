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
using Shouldly;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.PreferredCulture.Tests;


public class PreferredCultureTests
{
    [Test]
    public async Task CK_Ng_UserProfile_PreferredCulture_Async()
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        // The application is its own AuthCenter (with its HTTP front).
        configuration.FirstBinPath.AddAuthCenterApplication();
        configuration.FirstBinPath.Assemblies.AddRange( [
                "CK.Ng.Cris.AspNet.Authentication.Basic",
                "CK.DB.User.UserPassword",
                "CK.Ng.UserProfile",
                "CK.Ng.UserProfile.PreferredCulture",
                "CK.DB.User.PreferredCulture",
                "CK.SqlServer.Transaction"
            ] );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IO.User.PreferredCulture.ISetUserExtendedCultureCommand ),
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( IUserProfile ) );

        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );
        var engineRes = (await configuration.RunSuccessfullyAsync());

        var map = engineRes.LoadMap();

        #region Ensuring "TestUser" and its password...
        var userTable = map.StObjs.Obtain<DB.Actor.UserTable>().ShouldNotBeNull();
        using( var ctx = new SqlStandardCallContext() )
        {
            int idUser = await userTable.FindByNameAsync( ctx, "TestUser" );
            var pwdTable = map.StObjs.Obtain<UserPasswordTable>().ShouldNotBeNull();
            if( idUser <= 0 )
            {
                idUser = await userTable.CreateUserAsync( ctx, 1, "TestUser" );
            }
            await pwdTable.CreateOrUpdatePasswordUserAsync( ctx, 1, idUser, "success", DB.Auth.UCLMode.CreateOrUpdate );
        }
        #endregion

        var builder = WebApplication.CreateSlimBuilder();
        await using var server = await builder.CreateRunningAuthCenterApplicationAsync( map );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );
        runner.Run();
    }
}
