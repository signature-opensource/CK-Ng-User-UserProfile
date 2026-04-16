using CK.Core;
using CK.IO.Actor;
using CK.TypeScript;

namespace CK.Ng.UserProfile.NamedUser;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[RegisterTypeScriptType( typeof( ISetUserNameCommand ) )]
public class UserProfileNamedUserPackage : TypeScriptPackage
{
}
