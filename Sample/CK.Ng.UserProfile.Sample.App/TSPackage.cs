using CK.Core;
using CK.TypeScript;

namespace CK.Ng.UserProfile.Sample.App;

[TypeScriptPackage]
[Requires<CK.Ng.AspNet.Auth.Basic.TSPackage, CK.Ng.Cris.AspNet.Auth.TSPackage>]
[Requires<NamedUser.TSPackage>]
[Requires<PreferredCulture.TSPackage>]
[Requires<UserPassword.TSPackage>]
public class TSPackage : TypeScriptPackage
{
}
