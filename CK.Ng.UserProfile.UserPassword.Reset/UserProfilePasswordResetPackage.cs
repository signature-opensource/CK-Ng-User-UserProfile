using CK.Core;
using CK.IO.User.UserPassword.Reset;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Reset;

/// <summary>
/// Brings the temporary password flow: as long as <c>IUserProfile.IsTemporaryPassword</c> is true,
/// the user is redirected to the reset form and must choose a real password.
/// <para>
/// Unlike <c>CK.Ng.UserProfile.UserPassword.Lost</c>, this package has no dependency on the e-mail
/// feature: the user is already authenticated.
/// </para>
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePasswordPackage>]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public class UserProfilePasswordResetPackage : TypeScriptPackage
{
}
