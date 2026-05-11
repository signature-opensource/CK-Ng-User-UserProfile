using CK.Core;
using CK.IO.User.UserPassword;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[RegisterTypeScriptType( typeof( ISetPasswordCommand ) )]
public class UserProfilePasswordPackage : TypeScriptPackage
{
}
