using CK.Core;
using CK.IO.User.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

/// <summary>
/// The password section of the "Sign-in methods" tab of the user profile page (see <c>Res/sign-in-methods.t</c>):
/// "Change password" when the user has one, "Add a password" otherwise (a user created by a remote login, a
/// passkey-only user), and "Remove my password" (<see cref="IRemovePasswordCommand"/>: the user migrates to another
/// sign-in method; its last one is never removed). The three require a recent login (the Critical level) and are
/// refused while impersonating.
/// </summary>
[NgComponent]
[Package<UserProfilePasswordPackage>]
[Requires<ChangePasswordFormComponent>]
[RegisterTypeScriptType( typeof( IRemovePasswordCommand ) )]
public sealed class PasswordSectionComponent : NgComponent
{
}
