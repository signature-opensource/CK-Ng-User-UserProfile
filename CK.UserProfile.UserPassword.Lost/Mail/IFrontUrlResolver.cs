using CK.Core;

namespace CK.Ng.UserProfile.UserPassword.Lost.Mail;

/// <summary>
/// Resolves the root URL of the front-end used to build the links sent by e-mail.
/// </summary>
public interface IFrontUrlResolver : ISingletonAutoService
{
    /// <summary>
    /// Gets the front-end root URL, without any trailing slash.
    /// </summary>
    string ResolveFrontUrl();
}
