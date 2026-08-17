using CK.Cris;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Recovers a lost password: sets a new password for the user identified by a
/// <see cref="Token"/> previously sent by e-mail (see <see cref="ISendForgotPasswordEmailCommand"/>).
/// <para>
/// This command is anonymous by design: the token is the only proof of identity.
/// </para>
/// </summary>
public interface IRecoverPasswordCommand : ICommand<ICrisBasicCommandResult>, ICommandCurrentCulture
{
    /// <summary>
    /// Gets or sets the recovery token that identifies the user.
    /// </summary>
    public string Token { get; set; }

    /// <summary>
    /// Gets or sets the new password to set.
    /// </summary>
    public string Password { get; set; }
}
