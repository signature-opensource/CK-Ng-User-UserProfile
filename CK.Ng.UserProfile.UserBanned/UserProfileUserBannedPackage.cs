using CK.Core;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserBanned;

/// <summary>
/// Brings the banishment flow to the client: as soon as a user is banished it is logged out and sent
/// back to the authentication page, where the login is already refused by <c>CK.sAuthUserOnLogin</c>.
/// <para>
/// The navigation guard detects it (a navigation, a hard reload or a typed URL). This is not a security
/// mechanism: what actually makes a banishment effective is the server refusing the commands of a
/// banished actor and the refresh of its session.
/// </para>
/// <para>
/// Same shape as <c>CK.Ng.UserProfile.UserPassword.Reset</c>: a flag on the user profile, a
/// <c>CanActivateFn</c>, and an <c>AppRoutes.t</c> that hooks it onto the private page.
/// </para>
/// </summary>
[TypeScriptPackage]
[Requires<UserProfilePackage>]
// Navigation guard of the banishment flow, registered on the private page by AppRoutes.t.
[TypeScriptFile( "banned-guard.ts", "bannedGuard" )]
// Owns the single logout path.
[TypeScriptFile( "banned-session.ts", "BannedSession" )]
public class UserProfileUserBannedPackage : TypeScriptPackage
{
}
