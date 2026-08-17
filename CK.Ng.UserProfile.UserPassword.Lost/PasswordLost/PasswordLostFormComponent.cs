using CK.Core;
using CK.Ng.AspNet.Auth;
using CK.Ng.AspNet.Auth.Basic;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword.Lost;

/// <summary>
/// Anonymous page that asks for an e-mail address and triggers the sending of the
/// recovery link. Reached from the "Forgot your password?" link injected into the login form.
/// <para>
/// The route stays a child of the authentication page: the page is reachable at
/// <c>/auth/password-lost</c>, which is what the login form links to.
/// </para>
/// </summary>
[NgRoutedComponent<AuthenticationPageComponent>( Route = "password-lost", RegistrationMode = RouteRegistrationMode.Lazy )]
[Requires<BasicLoginFormComponent>]
[Package<UserProfilePasswordLostPackage>]
[RegisterTypeScriptType( typeof( ISendForgotPasswordEmailCommand ) )]
public sealed class PasswordLostFormComponent : NgRoutedComponent
{
}
