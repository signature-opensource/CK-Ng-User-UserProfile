using CK.Core;

namespace CK.UserProfile.UserPassword.Lost.Mail;

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
    /// Sends the e-mail carrying the recovery link. The link targets the client application of the party through which
    /// the user acts (what this party states about itself, never the request): when it has none, no mail is sent (an
    /// error is logged) and false is returned.
    /// </summary>
    /// <param name="validity">How long the link stays valid: the templates announce it.</param>
    /// <param name="callerPartyId">The PartyActorId of the party through which the user acts (0: the local party).</param>
    /// <returns>True if the mail has been sent.</returns>
    Task<bool> SendPasswordLostAsync( IActivityMonitor monitor, string destination, string token, TimeSpan validity, string firstName, string lastName, int callerPartyId );

    /// <summary>
    /// Sends the confirmation e-mail, once the password has actually been changed. Its links target the client
    /// application of the party through which the user acts: when it has none, no mail is sent and false is returned.
    /// </summary>
    /// <param name="callerPartyId">The PartyActorId of the party through which the user acts (0: the local party).</param>
    /// <returns>True if the mail has been sent.</returns>
    Task<bool> SendPasswordSetConfirmationAsync( IActivityMonitor monitor, string destination, string firstName, string lastName, int callerPartyId );
}
