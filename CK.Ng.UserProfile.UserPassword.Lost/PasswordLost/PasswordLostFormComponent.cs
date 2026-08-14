using CK.Core;
using CK.Ng.UserProfile.UserPassword.Lost;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.AspNet.Auth.Basic;

/// <summary>
/// Anonymous page that asks for an e-mail address and triggers the sending of the
/// recovery link. Reached from the "Forgot your password?" link injected into the login form.
/// <para>
/// Declared in the CK.Ng.AspNet.Auth.Basic namespace so that the generated TypeScript lands
/// next to basic-login-form and the authentication page components resolve unqualified.
/// </para>
/// </summary>
[NgRoutedComponent<AuthenticationPageComponent>( Route = "password-lost", RegistrationMode = RouteRegistrationMode.Lazy )]
[Requires<BasicLoginFormComponent>]
[Package<UserProfilePasswordLostPackage>]
[RegisterTypeScriptType( typeof( ISendForgotPasswordEmailCommand ) )]
public sealed class PasswordLostFormComponent : NgRoutedComponent
{
}
