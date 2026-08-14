using CK.Core;
using CK.TS.Angular;

namespace CK.Ng.UserProfile.UserPassword.Reset;

/// <summary>
/// Page an authenticated user is redirected to while its password is a temporary one.
/// <para>
/// It lives under the private page and carries no token: the user is already authenticated,
/// only the temporary state of its password is at stake.
/// </para>
/// </summary>
[NgRoutedComponent<INgPrivatePageComponent>( Route = "reset-password" )]
[Package<UserProfilePasswordResetPackage>]
public sealed class ResetPasswordFormComponent : NgRoutedComponent
{
}
