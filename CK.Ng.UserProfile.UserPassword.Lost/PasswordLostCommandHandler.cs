using CK.Core;
using CK.Cris;
using CK.IO.User.UserPassword;
using CK.Ng.UserProfile.UserPassword.Lost.Mail;
using CK.SqlServer;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Handles the two anonymous commands of the lost password flow.
/// <para>
/// Sending the recovery mail is deliberately silent about whether the address is known: the same
/// successful answer is returned in every case so that the command cannot be used to probe for
/// accounts. Recovering, on the other hand, does report a failure: the user is acting on a link
/// we sent and needs to know that it is no longer usable.
/// </para>
/// </summary>
public class PasswordLostCommandHandler : IAutoService
{
    /// <summary>
    /// Issues a recovery token for the user behind the given e-mail and sends the link.
    /// </summary>
    [CommandHandler]
    public async Task<ICrisBasicCommandResult> SendForgotPasswordEmailAsync( ISqlCallContext ctx,
                                                                             UserMessageCollector collector,
                                                                             ISendForgotPasswordEmailCommand cmd,
                                                                             PasswordLostQueries queries,
                                                                             PasswordLostTokenService tokenService,
                                                                             IPasswordLostMailer mailer )
    {
        // Never echo the address back in a user message: only the monitor knows it.
        using( ctx.Monitor.OpenInfo( $"Handling {nameof( ISendForgotPasswordEmailCommand )} command. (Email: {cmd.Email})" ) )
        {
            var res = cmd.CreateResult();
            try
            {
                var email = cmd.Email?.Trim();
                if( string.IsNullOrEmpty( email ) )
                {
                    ctx.Monitor.Warn( "Empty e-mail address." );
                }
                else
                {
                    var user = await queries.FindPasswordUserByEmailAsync( ctx, email );
                    if( user is null )
                    {
                        ctx.Monitor.Warn( $"No password user found for this e-mail: no mail sent. (Email: {email})" );
                    }
                    else
                    {
                        var token = tokenService.CreateToken( user.UserId );
                        await mailer.SendPasswordLostAsync( ctx.Monitor, email, token, tokenService.DefaultLifetime, user.FirstName, user.LastName );
                        ctx.Monitor.Info( $"Password recovery link sent. (UserId: {user.UserId})" );
                    }
                }
                // Same answer in all three cases: empty address, unknown address, or mail actually sent.
                collector.Info( "If this email is registered, you will receive instructions to reset your password.",
                                "User.PasswordLostRequested" );
            }
            catch( Exception e )
            {
                ctx.Monitor.Error( e );
                collector.Error( "An error occurred.", "User.PasswordRecoveryFailed" );
            }

            res.SetUserMessages( collector );
            return res;
        }
    }

    /// <summary>
    /// Validates the recovery token and sets the new password by emitting a
    /// <c>ISetPasswordCommand</c>: this handler knows nothing about the database.
    /// </summary>
    [CommandHandler]
    public async Task<ICrisBasicCommandResult> RecoverPasswordAsync( ISqlCallContext ctx,
                                                                     UserMessageCollector collector,
                                                                     IRecoverPasswordCommand cmd,
                                                                     IServiceProvider services,
                                                                     RawCrisExecutor rawExecutor,
                                                                     PocoDirectory pocoDir,
                                                                     PasswordLostTokenService tokenService,
                                                                     PasswordLostQueries queries,
                                                                     IPasswordLostMailer mailer )
    {
        using( ctx.Monitor.OpenInfo( $"Handling {nameof( IRecoverPasswordCommand )} command." ) )
        {
            var res = cmd.CreateResult();
            try
            {
                if( !tokenService.TryReadToken( ctx.Monitor, cmd.Token, out var userId ) )
                {
                    collector.Error( "This reset link is no longer valid. Please start a new password reset request.",
                                     "User.PasswordRecoveryInvalidToken" );
                }
                else
                {
                    // The token is the only proof of identity: the command is emitted on behalf of the
                    // user it designates. Incoming validators do not run on internally emitted commands,
                    // so the "ActorId must match UserId" rule is satisfied by construction here.
                    //
                    // The base command is emitted on purpose, not its CK.IO.User.UserPassword.Reset
                    // extension: this package has no business knowing about temporary passwords. When
                    // the Reset package is part of the application the Poco is the merged one anyway,
                    // and its IsTemporary defaults to false — which is exactly what recovering a
                    // password means: the user chose this one, so any temporary state is cleared.
                    var setCmd = pocoDir.Create<ISetPasswordCommand>( c =>
                    {
                        c.ActorId = userId;
                        c.UserId = userId;
                        c.Password = cmd.Password;
                        // The nested command runs with the same culture as this one.
                        c.CurrentCultureName = cmd.CurrentCultureName;
                    } );

                    // ICrisCommandContext cannot be injected here: carrying an explicit
                    // CurrentCultureName makes CrisAspNetService build an AmbientServiceHub, which
                    // routes this command to the CrisBackgroundExecutor. That endpoint has no
                    // registered CrisExecutionContext (the framework builds its own [ExcludedCKType]
                    // JobExecutionContext there with 'new'), and resubmitting to the background
                    // executor would deadlock: it runs a single runner by default, the very one this
                    // handler occupies.
                    // RawCrisExecutor is a singleton available in every endpoint, and this call is
                    // exactly the first line of CrisExecutionContext.ExecuteRootCommandAsync. What it
                    // leaves out is event propagation, which this flow does not need: should the flow
                    // ever emit an event, build a CrisExecutionContext instead (its constructor is
                    // public and takes the monitor, this scope, a DarkSideCrisEventHub and this
                    // executor).
                    var executed = await rawExecutor.RawExecuteAsync( services, setCmd );
                    if( executed.Result is ICrisResultError error )
                    {
                        ctx.Monitor.Error( $"SetPassword failed: {string.Join( ", ", error.Errors.Select( e => e.Text ) )}" );
                        collector.Error( "An error occurred.", "User.PasswordRecoveryFailed" );
                    }
                    else
                    {
                        ctx.Monitor.Info( $"Password successfully recovered. (UserId: {userId})" );
                        collector.Info( "Your password has been updated.", "User.PasswordRecovered" );

                        // Best effort: a failure to send the confirmation must not fail the recovery.
                        try
                        {
                            var user = await queries.FindPasswordUserByIdAsync( ctx, userId );
                            if( user is not null && !string.IsNullOrEmpty( user.Email ) )
                            {
                                await mailer.SendPasswordSetConfirmationAsync( ctx.Monitor, user.Email, user.FirstName, user.LastName );
                            }
                        }
                        catch( Exception e )
                        {
                            ctx.Monitor.Warn( "Could not send the password change confirmation e-mail.", e );
                        }
                    }
                }
            }
            catch( Exception e )
            {
                ctx.Monitor.Error( e );
                collector.Error( "An error occurred.", "User.PasswordRecoveryFailed" );
            }

            res.SetUserMessages( collector );
            return res;
        }
    }
}
