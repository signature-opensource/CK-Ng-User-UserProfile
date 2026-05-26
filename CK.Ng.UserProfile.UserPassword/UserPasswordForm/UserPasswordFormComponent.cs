using CK.Core;
using CK.IO.User.UserPassword;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

[NgComponent]
[Package<UserProfilePasswordPackage>]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public sealed class UserPasswordFormComponent : NgComponent
{
}
