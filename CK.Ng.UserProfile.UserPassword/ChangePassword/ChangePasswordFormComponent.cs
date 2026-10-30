using CK.Core;
using CK.IO.User.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

/// <summary>
/// Form that lets an authenticated user change its own password (<see cref="ISetPasswordCommand"/>) or, in its "add"
/// mode, add one when it has none (<see cref="IAddPasswordCommand"/>): displayed by the password section of the
/// "Sign-in methods" tab of the user profile page.
/// </summary>
[NgComponent]
[Package<UserProfilePasswordPackage>]
[Requires<PasswordStrengthComponent>]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
[RegisterTypeScriptType( typeof( IAddPasswordCommand ) )]
public sealed class ChangePasswordFormComponent : NgComponent
{
}
