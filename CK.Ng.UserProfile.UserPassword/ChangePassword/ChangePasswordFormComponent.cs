using CK.Core;
using CK.IO.User.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

/// <summary>
/// Form that lets an authenticated user change its own password, displayed in the
/// "Security" tab of the user profile page.
/// </summary>
[NgComponent]
[Package<UserProfilePasswordPackage>]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public sealed class ChangePasswordFormComponent : NgComponent
{
}
