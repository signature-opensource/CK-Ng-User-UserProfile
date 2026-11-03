using System.Collections.Generic;
using CK.Core;
using CK.Template.Fluid;

namespace CK.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Model of the <c>PasswordLost</c> templates: the recovery link is built as
/// <c>{{ clientUrl }}/auth/recover-password/{{ token }}</c>.
/// </summary>
[FluidTemplate( "PasswordLost" )]
public interface IPasswordLostModel : IPoco
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

    /// <summary>The recovery token appended to the URL.</summary>
    string Token { get; set; }

    /// <summary>
    /// How long the link stays valid, in whole hours. The unit word belongs to the templates,
    /// which are already per-culture; rendering it here would produce English text in the
    /// French mail. Templates use it as <c>{{ validityHours }} heures</c>.
    /// </summary>
    int ValidityHours { get; set; }

    /// <summary>First name of the recipient. May be empty.</summary>
    string FirstName { get; set; }

    /// <summary>Last name of the recipient. May be empty.</summary>
    string LastName { get; set; }
}
