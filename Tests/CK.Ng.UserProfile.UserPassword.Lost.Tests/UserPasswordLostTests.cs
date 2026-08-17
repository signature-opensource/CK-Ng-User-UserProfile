using CK.AppIdentity;
using CK.Core;
using CK.Cris;
using CK.Cris.AspNet;
using CK.DB.Actor.ActorEMail;
using CK.DB.User.UserPassword;
using CK.IO.Actor;
using CK.Ng.UserProfile.UserPassword.Lost.Tests.MyLayout;
using CK.SqlServer;
using CK.Testing;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;
using Shouldly;
using System.Diagnostics;
using static CK.Testing.MonitorTestHelper;

namespace CK.Ng.UserProfile.UserPassword.Lost.Tests;

[TestFixture]
public class UserPasswordLostTests
{
    /// <summary>
    /// The address the TypeScript test uses: it must resolve to TestUser.
    /// </summary>
    const string TestUserEMail = "testuser@example.com";

    [TestCase( "test" )]
    [TestCase( "ck-watch", Explicit = true )]
    public async Task CK_Ng_UserProfile_UserPassword_Lost_Async( string yarnCommand )
    {
        var targetProjectPath = TestHelper.GetTypeScriptInlineTargetProjectPath();

        var configuration = TestHelper.CreateDefaultEngineConfiguration();
        configuration.FirstBinPath.Path = TestHelper.BinFolder;
        configuration.EnsureSqlServerConfigurationAspect();

        configuration.FirstBinPath.Assemblies.AddRange( [ "CK.Cris.Auth",
                                                          "CK.Ng.Cris.AspNet.Auth",
                                                          "CK.DB.AspNet.Auth",
                                                          "CK.Ng.AspNet.Auth.Basic",
                                                          "CK.DB.User.UserPassword",
                                                          // The e-mail to user resolution reads CK.tActorEMail and the
                                                          // FirstName/LastName that NamedUser adds to CK.vUser.
                                                          "CK.DB.Actor.ActorEMail",
                                                          "CK.DB.User.NamedUser",
                                                          // Without it the Smtp EmailSenderFactory is not in the graph and
                                                          // IDefaultEmailSender silently resolves to a sender that drops
                                                          // the message.
                                                          "CK.Mailer.MailKit",
                                                          "CK.Ng.UserProfile",
                                                          "CK.Ng.UserProfile.UserPassword",
                                                          "CK.Ng.UserProfile.UserPassword.Lost" ] );

        var tsConfig = configuration.FirstBinPath.EnsureTypeScriptConfigurationAspect( targetProjectPath,
                                                                                       typeof( IGetUserProfileQCommand ),
                                                                                       typeof( ISendForgotPasswordEmailCommand ),
                                                                                       typeof( IRecoverPasswordCommand ),
                                                                                       typeof( IO.User.UserPassword.ISetPasswordCommand ),
                                                                                       typeof( IUserProfile ) );

        tsConfig.ActiveCultures.Add( NormalizedCultureInfo.EnsureNormalizedCultureInfo( "fr" ) );
        var engineRes = (await configuration.RunSuccessfullyAsync());

        // The mailer writes to a pickup directory instead of sending: the real PasswordLostMailer
        // runs, so the Fluid templates are actually rendered and can be asserted on.
        // Under obj/ so that the produced .eml files stay out of the way of git.
        var pickupDirectory = TestHelper.TestProjectFolder.AppendPart( "obj" ).AppendPart( "MailPickup" );
        if( Directory.Exists( pickupDirectory ) ) Directory.Delete( pickupDirectory, true );
        Directory.CreateDirectory( pickupDirectory );

        // PasswordLostTokenService, the front URL resolver and the mailer all read the CK-AppIdentity
        // configuration: a real host gets it from appsettings, here it is built in memory.
        var appIdentity = ApplicationIdentityServiceConfiguration.Create( TestHelper.Monitor, c =>
        {
            c["FullName"] = "Test/$UserPasswordLost";
            c["Local:FrontUrl"] = "http://localhost:4200";
            // Exercises the configurable lifetime rather than the 2 hours fallback.
            c["Local:PasswordLostTokenLifetime"] = "00:45:00";
            c["Local:EmailSender:Smtp:UsePickupDirectory"] = "true";
            c["Local:EmailSender:Smtp:PickupDirectory"] = pickupDirectory;
            c["Local:EmailSender:Smtp:SendEmail"] = "false";
            c["Local:EmailSender:Smtp:RequiredAuthentication"] = "false";
        } );
        Throw.CheckState( appIdentity != null );

        static void ConfigureHostServices( IServiceCollection services, ApplicationIdentityServiceConfiguration appIdentity )
        {
            services.AddSingleton( appIdentity );
            // The recovery token is protected by ASP.NET Core Data Protection.
            services.AddDataProtection();
        }

        #region Ensuring TestUser, its password and its validated primary e-mail...
        var autoServices = engineRes.CreateAutomaticServices( configureServices: services => ConfigureHostServices( services, appIdentity ) );
        using( var scope = autoServices.Services.CreateScope() )
        using( var ctx = new SqlStandardCallContext() )
        {
            var services = scope.ServiceProvider;
            var pocoDir = services.GetRequiredService<PocoDirectory>();
            var backgroundExecutor = services.GetRequiredService<CrisBackgroundExecutor>();
            var userTable = services.GetRequiredService<DB.Actor.UserTable>();
            var pwdTable = services.GetRequiredService<UserPasswordTable>();
            var emailTable = services.GetRequiredService<ActorEMailTable>();

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

            // Only a primary AND validated address is accepted by the flow.
            await emailTable.AddEMailAsync( ctx, 1, userId, TestUserEMail, isPrimary: true );
            await emailTable.ValidateEMailAsync( ctx, 1, userId, TestUserEMail );
        }
        #endregion

        var map = engineRes.LoadMap();
        var builder = WebApplication.CreateSlimBuilder();
        builder.AddUnsafeAllowAllCors();
        builder.AddWebFrontAuth( ao => ao.SlidingExpirationTime = TimeSpan.FromMinutes( 10 ) );
        ConfigureHostServices( builder.Services, appIdentity );
        await using var server = await builder.CreateRunningAspNetServerAsync( map, app => app.UseMiddleware<CrisMiddleware>() );
        await using var runner = TestHelper.CreateTypeScriptRunner( targetProjectPath, server.ServerAddress );
        await TestHelper.SuspendAsync( resume => resume );

        if( !Debugger.IsAttached && yarnCommand == "ck-watch" )
        {
            TestHelper.Monitor.Warn( $"No debugger currently attached. Changing ck-watch to test." );
            yarnCommand = "test";
        }
        runner.Run( yarnCommand );

        #region The TypeScript test asked for one recovery mail: it must have been rendered and dropped.
        var mails = Directory.GetFiles( pickupDirectory );
        mails.ShouldNotBeEmpty( "The known address must have produced exactly one mail." );
        var body = File.ReadAllText( mails[0] );
        // Written by PasswordLost.Body.*.liquid: proves the templates render and that the link
        // points to the renamed route.
        body.ShouldContain( "/#/auth/recover-password/" );
        // {{ validityHours }} rendered from the configured 45 minutes, floored to one hour.
        body.ShouldContain( "1 hour(s)" );
        // The unknown address must not have produced anything.
        mails.Length.ShouldBe( 1 );
        #endregion
    }
}
