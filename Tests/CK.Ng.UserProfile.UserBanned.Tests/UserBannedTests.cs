using CK.Core;
using CK.IO.Actor;
using CK.Testing;
using NUnit.Framework;
using System.Diagnostics;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserBanned.Tests;

[TestFixture]
public class UserBannedTests
{
    /// <summary>
    /// Runs the engine and hands the generated TypeScript to jest.
    /// <para>
    /// No ASP.NET server and no user in database here, unlike the sibling test projects: what is under
    /// test is the route registration this package performs and the behaviour of its guard, and the
    /// guard reads two signals off the UserService which the specs stub. The three detection paths that
    /// do need a live session channel (the push, and the rejection of the channel registration) are
    /// not covered.
    /// </para>
    /// </summary>
    [TestCase( "test" )]
    [TestCase( "ck-watch", Explicit = true )]
    public async Task CK_Ng_UserProfile_UserBanned_Async( string yarnCommand )
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.Cris.Auth",
                                                          "CK.Ng.Cris.AspNet.Auth",
                                                          "CK.DB.AspNet.Auth",
                                                          "CK.Ng.AspNet.Auth.Basic",
                                                          "CK.Ng.UserProfile",
                                                          "CK.Ng.UserProfile.UserBanned" ] );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IUpdateUserCommand ),
                                                                                       typeof( ISetUserNameCommand ),
                                                                                       typeof( IGetUserProfileQCommand ) );

        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );
        await configuration.RunSuccessfullyAsync();

        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath );
        await TestHelper.SuspendAsync( resume => resume );

        if( !Debugger.IsAttached && yarnCommand == "ck-watch" )
        {
            TestHelper.Monitor.Warn( $"No debugger currently attached. Changing ck-watch to test." );
            yarnCommand = "test";
        }
        runner.Run( yarnCommand );
    }
}
