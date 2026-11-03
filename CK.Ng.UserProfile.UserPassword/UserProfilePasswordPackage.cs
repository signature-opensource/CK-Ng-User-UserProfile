using CK.Core;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPassword;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[TypeScriptFile( "password-rules.ts", "PASSWORD_MIN_LENGTH", "PASSWORD_CRITERIA", "PasswordCriterion", "passwordComplexity", "passwordsMatch" )]
public class UserProfilePasswordPackage : TypeScriptPackage
{
}
