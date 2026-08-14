using CK.Core;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Brings the lost password flow: the anonymous "password lost" page that asks for an e-mail,
/// and the "recover password" page reached through the link sent by e-mail.
/// <para>
/// This is the only satellite of <see cref="UserProfilePasswordPackage"/> that depends on the
/// e-mail feature: consumers that do not want it simply do not reference this package.
/// </para>
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePasswordPackage>]
public class UserProfilePasswordLostPackage : TypeScriptPackage
{
}
