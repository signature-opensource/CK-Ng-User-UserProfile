using CK.Core;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserOidc;

/// <summary>
/// Adds the OpenID Connect section to the "Sign-in methods" tab of the user profile page (see
/// <c>Res/sign-in-methods.t</c>): the user lists its identities, unlinks them and links another provider.
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePackage>]
public class UserProfileOidcPackage : TypeScriptPackage
{
}
