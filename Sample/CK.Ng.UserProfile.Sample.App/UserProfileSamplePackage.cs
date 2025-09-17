using CK.Core;
using CK.Ng.AspNet.Auth.Basic;
using CK.Ng.Cris.AspNet.Auth;
using CK.TypeScript;

namespace CK.Ng.UserProfile.Sample.App;

[TypeScriptPackage]
[Requires<AspNetAuthBasicPackage, CrisAspNetAuthPackage>]
[Requires<NamedUser.UserProfileNamedUserPackage>]
[Requires<PreferredCulture.UserProfilePreferredCulturePackage>]
[Requires<UserPassword.UserProfilePasswordPackage>]
public class UserProfileSamplePackage : TypeScriptPackage
{
}
