using CK.Core;
using CK.Ng.AspNet.Auth;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Anonymous page reached through the link sent by e-mail: the token carried by the route
/// identifies the user, who chooses a new password.
/// <para>
/// The route stays a child of the authentication page: the page is reachable at
/// <c>/auth/recover-password/:token</c>, which is the link the mail carries.
/// </para>
/// </summary>
[NgRoutedComponent<AuthenticationPageComponent>( Route = "recover-password/:token", RegistrationMode = RouteRegistrationMode.Lazy )]
[Package<UserProfilePasswordLostPackage>]
[Requires<PasswordStrengthComponent>]
[RegisterTypeScriptType( typeof( IRecoverPasswordCommand ) )]
public sealed class RecoverPasswordFormComponent : NgRoutedComponent
{
}
