using CK.Core;
using CK.Template.Fluid;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Model of the <c>PasswordSetConfirmation</c> templates, sent once the password has
/// actually been changed through the recovery flow.
/// </summary>
[FluidTemplate( "PasswordSetConfirmation" )]
public interface IPasswordSetConfirmationModel : IPoco
{
    /// <summary>Root URL of the front-end (no trailing slash).</summary>
    string FrontUrl { get; set; }

    /// <summary>First name of the recipient. May be empty.</summary>
    string FirstName { get; set; }

    /// <summary>Last name of the recipient. May be empty.</summary>
    string LastName { get; set; }
}
