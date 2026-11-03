using System.Collections.Generic;
using CK.Core;
using CK.Template.Fluid;

namespace CK.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Model of the <c>PasswordSetConfirmation</c> templates, sent once the password has
/// actually been changed through the recovery flow.
/// </summary>
[FluidTemplate( "PasswordSetConfirmation" )]
public interface IPasswordSetConfirmationModel : IPoco
{
    /// <summary>
    /// The URL (without trailing slash) of the default client application of the party through which the user acts:
    /// <c>https://acme.com</c>.
    /// </summary>
    string ClientUrl { get; set; }

    /// <summary>
    /// The URL (without trailing slash) of each client application of this party, by name: a template that targets
    /// another client application than the default one uses it (<c>{{ clientUrls.MiniApp }}</c>).
    /// </summary>
    IDictionary<string, string> ClientUrls { get; }

    /// <summary>First name of the recipient. May be empty.</summary>
    string FirstName { get; set; }

    /// <summary>Last name of the recipient. May be empty.</summary>
    string LastName { get; set; }
}
