using CK.Core;
using CK.IO.User.UserPassword;
using CK.Ng.UserProfile.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.AspNet.Auth.Basic;

[NgRoutedComponent<AuthenticationPageComponent>( Route = "reset-password/:token", RegistrationMode = RouteRegistrationMode.Lazy )]
[Package<UserProfilePasswordPackage>]
[RegisterTypeScriptType( typeof( IResetPasswordCommand ) )]
public sealed class ResetPasswordComponent : NgRoutedComponent
{
}
