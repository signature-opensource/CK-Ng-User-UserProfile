using CK.Core;
using CK.Ng.Cris.AspNet.Authentication.Passkey;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPasskey;

/// <summary>
/// Adds the passkey section to the "Sign-in methods" tab of the user profile page (see <c>Res/sign-in-methods.t</c>):
/// the user lists, renames, deletes and adds its passkeys.
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePackage, NgCrisAuthenticationPasskeyPackage>]
public class UserProfilePasskeyPackage : TypeScriptPackage
{
}
