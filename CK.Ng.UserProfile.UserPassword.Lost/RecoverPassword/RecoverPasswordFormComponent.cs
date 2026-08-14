using CK.Core;
using CK.Ng.UserProfile.UserPassword.Lost;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.AspNet.Auth.Basic;

/// <summary>
/// Anonymous page reached through the link sent by e-mail: the token carried by the route
/// identifies the user, who chooses a new password.
/// </summary>
[NgRoutedComponent<AuthenticationPageComponent>( Route = "recover-password/:token", RegistrationMode = RouteRegistrationMode.Lazy )]
[Package<UserProfilePasswordLostPackage>]
[RegisterTypeScriptType( typeof( IRecoverPasswordCommand ) )]
public sealed class RecoverPasswordFormComponent : NgRoutedComponent
{
}
