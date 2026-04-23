using CK.Core;
using CK.IO.User.NamedUser;
using CK.TypeScript;

namespace CK.Ng.UserProfile.NamedUser;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[RegisterTypeScriptType( typeof( ISetUserNamesCommand ) )]
public class UserProfileNamedUserPackage : TypeScriptPackage
{
}
