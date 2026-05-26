using CK.Core;
using CK.IO.User.UserPassword;
using CK.Ng.UserProfile.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.AspNet.Auth.Basic;

[NgRoutedComponent<AuthenticationPageComponent>( Route = "password-lost" )]
[Requires<BasicLoginFormComponent>]
[Package<UserProfilePasswordPackage>]
[RegisterTypeScriptType( typeof( ISendForgotPasswordEmailCommand ) )]
public sealed class PasswordLostComponent : NgRoutedComponent
{
}
