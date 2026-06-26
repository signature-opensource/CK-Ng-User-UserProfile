using CK.Core;
using CK.IO.User.PreferredCulture;
using CK.TypeScript;

namespace CK.Ng.UserProfile.PreferredCulture;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[RegisterTypeScriptType( typeof( ISetUserExtendedCultureCommand ) )]
public class UserProfilePreferredCulturePackage : TypeScriptPackage
{
}
