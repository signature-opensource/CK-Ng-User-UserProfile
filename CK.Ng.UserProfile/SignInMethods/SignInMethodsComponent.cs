using CK.Core;
using CK.TS.Angular;

namespace CK.Ng.UserProfile;

/// <summary>
/// The content of the "Sign-in methods" tab of the user profile page: the sign-in methods of the user and their last
/// use (known by the browser: the schemes of the authentication), then the sections that the satellite packages inject
/// (the password, the passkeys, the OpenID Connect identities...) between its <c>PreSignInMethodsSections</c> and
/// <c>PostSignInMethodsSections</c> anchors.
/// </summary>
[NgComponent]
[Package<UserProfilePackage>]
[RequiredBy<UserProfilePageComponent>]
public sealed class SignInMethodsComponent : NgComponent
{
}
