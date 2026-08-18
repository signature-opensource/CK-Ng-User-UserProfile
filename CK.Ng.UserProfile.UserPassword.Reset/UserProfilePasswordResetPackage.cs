using CK.Core;
using CK.IO.User.UserPassword.Reset;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Reset;

/// <summary>
/// Brings the temporary password flow: as long as <c>IUserProfile.IsTemporaryPassword</c> is true,
/// every private page is forbidden to the user until it has chosen a real password: the
/// <c>temporaryPasswordGuard</c> registered as the <c>canActivateChild</c> of the private page
/// redirects it to the reset form.
/// <para>
/// Unlike <c>CK.Ng.UserProfile.UserPassword.Lost</c>, this package has no dependency on the e-mail
/// feature: the user is already authenticated.
/// </para>
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePasswordPackage>]
// Navigation guard of the temporary password flow, registered on the private page by AppRoutes.t.
[TypeScriptFile( "temporary-password-guard.ts", "temporaryPasswordGuard" )]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public class UserProfilePasswordResetPackage : TypeScriptPackage
{
}
