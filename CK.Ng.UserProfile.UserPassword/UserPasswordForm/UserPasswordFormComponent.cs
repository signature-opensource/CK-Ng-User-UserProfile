using CK.Core;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

[NgComponent]
[Package<TSPackage>]
[TypeScriptFile( "user-password-validator.ts", "UserPasswordValidator" )]
public sealed class UserPasswordFormComponent : NgComponent
{
}
