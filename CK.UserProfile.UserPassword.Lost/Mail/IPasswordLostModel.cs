using CK.Core;
using CK.Template.Fluid;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Model of the <c>PasswordLost</c> templates: the recovery link is built as
/// <c>{{ frontUrl }}/#/auth/recover-password/{{ token }}</c>.
/// </summary>
[FluidTemplate( "PasswordLost" )]
public interface IPasswordLostModel : IPoco
{
    /// <summary>Root URL of the front-end (no trailing slash), e.g. <c>http://localhost:4200</c>.</summary>
    string FrontUrl { get; set; }

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
