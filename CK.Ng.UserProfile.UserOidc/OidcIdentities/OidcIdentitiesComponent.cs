using CK.Core;
using CK.IO.User.UserOidc;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserOidc;

/// <summary>
/// The OpenID Connect section: the user's identities (<see cref="IGetOidcIdentitiesQCommand"/>: the provider, the
/// account at the provider, the last sign-in, and what the provider shared as an expandable detail), unlinked
/// (<see cref="IUnlinkOidcIdentityCommand"/>: a recent login, not while impersonating, never the last sign-in method),
/// and the providers the user can link (a remote login that binds the identity to the user:
/// <c>AuthService.startPopupBinding</c>).
/// </summary>
[NgComponent]
[Package<UserProfileOidcPackage>]
[RegisterTypeScriptType( typeof( IGetOidcIdentitiesQCommand ) )]
[RegisterTypeScriptType( typeof( IUnlinkOidcIdentityCommand ) )]
public sealed class OidcIdentitiesComponent : NgComponent
{
}
