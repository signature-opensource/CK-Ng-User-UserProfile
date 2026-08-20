using CK.Core;
using CK.IO.User.UserPassword.Reset;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Reset;

/// <summary>
/// Brings the temporary password flow: as long as <c>IUserProfile.IsTemporaryPassword</c> is true,
/// every private page is forbidden to the user until it has chosen a real password: the
/// <c>temporaryPasswordGuard</c> registered by AppRoutes.t as the <c>canActivate</c> of the private
/// page redirects it to the reset form, which lives under the authentication page.
/// <para>
/// Unlike <c>CK.Ng.UserProfile.UserPassword.Lost</c>, this package has no dependency on the e-mail
/// feature: the user is already authenticated.
/// </para>
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePasswordPackage>]
// AppRoutes.t anchors on the "children: rPrivatePage" of the generated routes: the private page
// must be in the graph. Nothing else expresses it since the reset form left it for the
// authentication page.
[Requires<INgPrivatePageComponent>]
// Navigation guard of the temporary password flow, registered on the private page by AppRoutes.t.
[TypeScriptFile( "temporary-password-guard.ts", "temporaryPasswordGuard" )]
// Guard of the reset page itself, registered on its own route by AuthRoutes.t.
[TypeScriptFile( "reset-password-page-guard.ts", "resetPasswordPageGuard", "RESET_PASSWORD_URL" )]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public class UserProfilePasswordResetPackage : TypeScriptPackage
{
}
