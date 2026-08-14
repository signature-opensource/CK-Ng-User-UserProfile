using CK.Core;
using CK.Cris;
using CK.IO.User.UserPassword;
using CK.Ng.UserProfile.UserPassword.Lost.Mail;
using CK.SqlServer;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Handles the two anonymous commands of the lost password flow.
/// <para>
/// Both handlers are deliberately silent about whether an address or a token is known: the same
/// message is returned in every case so that neither command can be used to probe for accounts.
/// </para>
/// </summary>
public class PasswordLostCommandHandler : IAutoService
{
    readonly CurrentCultureInfo _currentCulture;

    public PasswordLostCommandHandler( CurrentCultureInfo currentCulture )
    {
        _currentCulture = currentCulture;
    }

    /// <summary>
    /// Issues a recovery token for the user behind the given e-mail and sends the link.
    /// </summary>
    [CommandHandler]
    public async Task<SimpleUserMessage> SendForgotPasswordEmailAsync( ISqlCallContext ctx,
                                                                       ISendForgotPasswordEmailCommand cmd,
                                                                       PasswordLostQueries queries,
                                                                       PasswordLostTokenService tokenService,
                                                                       IPasswordLostMailer mailer )
    {
        // Never echo the address back in a user message: only the monitor knows it.
        using( ctx.Monitor.OpenInfo( $"Handling {nameof( ISendForgotPasswordEmailCommand )} command. (Email: {cmd.Email})" ) )
        {
            // The answer is the same whether the address is known or not: it must not disclose
            // the existence of an account.
            var neutralAnswer = _currentCulture.InfoMessage(
                "If this email is registered, you will receive instructions to reset your password.",
                "User.PasswordLostRequested" );
            try
            {
                var email = cmd.Email?.Trim();
                if( string.IsNullOrEmpty( email ) )
                {
                    ctx.Monitor.Warn( "Empty e-mail address." );
                    return neutralAnswer;
                }

                var user = await queries.FindPasswordUserByEmailAsync( ctx, email );
                if( user is null )
                {
                    ctx.Monitor.Warn( $"No password user found for this e-mail: no mail sent. (Email: {email})" );
                    return neutralAnswer;
                }

                var token = tokenService.CreateToken( user.UserId );
                await mailer.SendPasswordLostAsync( ctx.Monitor, email, token, tokenService.DefaultLifetime, user.FirstName, user.LastName );
                ctx.Monitor.Info( $"Password recovery link sent. (UserId: {user.UserId})" );

                return neutralAnswer;
            }
            catch( Exception e )
            {
                ctx.Monitor.Error( e );
                return _currentCulture.ErrorMessage( "An error occurred.", "CrisError.ExceptionCaught" );
            }
        }
    }

    /// <summary>
    /// Validates the recovery token and sets the new password by emitting a
    /// <c>ISetPasswordCommand</c>: this handler knows nothing about the database.
    /// </summary>
    [CommandHandler]
    public async Task<SimpleUserMessage> RecoverPasswordAsync( ISqlCallContext ctx,
                                                                IRecoverPasswordCommand cmd,
                                                                ICrisCommandContext commandCtx,
                                                                PocoDirectory pocoDir,
                                                                PasswordLostTokenService tokenService,
                                                                PasswordLostQueries queries,
                                                                IPasswordLostMailer mailer )
    {
        using( ctx.Monitor.OpenInfo( $"Handling {nameof( IRecoverPasswordCommand )} command." ) )
        {
            try
            {
                if( !tokenService.TryReadToken( ctx.Monitor, cmd.Token, out var userId ) )
                {
                    return _currentCulture.ErrorMessage(
                        "This reset link is no longer valid. Please start a new password reset request.",
                        "User.PasswordRecoveryInvalidToken" );
                }

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
                } );

                var executed = await commandCtx.ExecuteAsync( setCmd );
                if( executed.Result is ICrisResultError error )
                {
                    ctx.Monitor.Error( $"SetPassword failed: {string.Join( ", ", error.Errors.Select( e => e.Text ) )}" );
                    return _currentCulture.ErrorMessage( "An error occurred.", "CrisError.ExceptionCaught" );
                }

                ctx.Monitor.Info( $"Password successfully recovered. (UserId: {userId})" );

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

                return _currentCulture.InfoMessage( "Your password has been updated.", "User.PasswordRecovered" );
            }
            catch( Exception e )
            {
                ctx.Monitor.Error( e );
                return _currentCulture.ErrorMessage( "An error occurred.", "CrisError.ExceptionCaught" );
            }
        }
    }
}
