using CK.Core;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[TypeScriptFile( "password-validators.ts", "PASSWORD_MIN_LENGTH", "passwordComplexityValidator", "passwordsMatchValidator" )]
public class UserProfilePasswordPackage : TypeScriptPackage
{
}
