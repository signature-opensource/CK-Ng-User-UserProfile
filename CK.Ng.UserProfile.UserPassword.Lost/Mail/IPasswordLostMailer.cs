using CK.Core;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Sends the lost password e-mails. The default implementation renders the Fluid templates
/// of this package and dispatches through the CK-AppIdentity-configured mailer.
/// <para>
/// Two override points are available to consumers:
/// <list type="bullet">
///   <item>Override only the content: declare a <c>[FluidTemplatePackage]</c> and embed a
///   <c>Res/Templates/PasswordLost.{Subject|Body}.{culture}.liquid</c> with the same logical
///   name — the consumer registration wins over the default one.</item>
///   <item>Override the whole behavior: provide another <see cref="IPasswordLostMailer"/> and
///   substitute it with <c>[ReplaceAutoService]</c>.</item>
/// </list>
/// </para>
/// </summary>
public interface IPasswordLostMailer : IAutoService
{
    /// <summary>
    /// Sends the e-mail carrying the recovery link.
    /// </summary>
    /// <param name="validity">How long the link stays valid: the templates announce it.</param>
    Task SendPasswordLostAsync( IActivityMonitor monitor, string destination, string token, TimeSpan validity, string firstName, string lastName );

    /// <summary>
    /// Sends the confirmation e-mail, once the password has actually been changed.
    /// </summary>
    Task SendPasswordSetConfirmationAsync( IActivityMonitor monitor, string destination, string firstName, string lastName );
}
