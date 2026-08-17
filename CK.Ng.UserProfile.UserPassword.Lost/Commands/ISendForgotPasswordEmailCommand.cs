using CK.Cris;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Sends the "password lost" e-mail that carries the recovery token to be used
/// by <see cref="IRecoverPasswordCommand"/>.
/// <para>
/// This command is anonymous by design. Its result must not disclose whether the
/// address is known: the same message is returned in all cases.
/// </para>
/// </summary>
public interface ISendForgotPasswordEmailCommand : ICommand<ICrisBasicCommandResult>, ICommandCurrentCulture
{
    /// <summary>
    /// Gets or sets the e-mail address the recovery link must be sent to.
    /// </summary>
    public string Email { get; set; }
}
