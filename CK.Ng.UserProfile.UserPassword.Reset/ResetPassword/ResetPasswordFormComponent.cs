using CK.Core;
using CK.Ng.AspNet.Auth;
using CK.TS.Angular;

namespace CK.Ng.UserProfile.UserPassword.Reset;

/// <summary>
/// Page an authenticated user is redirected to while its password is a temporary one.
/// <para>
/// It carries no token: the user is already authenticated, only the temporary state of its
/// password is at stake. The route is nonetheless a child of the authentication page, at
/// <c>/auth/reset-password</c>: the only thing the user can do here is choose a password, and
/// the application shell of the private page would offer it a navigation that the
/// <c>temporaryPasswordGuard</c> immediately undoes.
/// </para>
/// <para>
/// Being outside the private page, it loses the <c>canMatch</c> that guarded it against
/// anonymous access: <c>resetPasswordPageGuard</c> takes that over.
/// </para>
/// </summary>
[NgRoutedComponent<AuthenticationPageComponent>( Route = "reset-password", RegistrationMode = RouteRegistrationMode.Lazy )]
[Package<UserProfilePasswordResetPackage>]
[Requires<PasswordStrengthComponent>]
public sealed class ResetPasswordFormComponent : NgRoutedComponent
{
}
