using CK.Core;
using CK.IO.User.UserBanned;
using CK.Ng.AspNet.Auth.Basic;
using CK.Ng.Cris.AspNet.Auth;
using CK.TypeScript;

namespace CK.Ng.UserProfile.Sample.App;

[TypeScriptPackage]
[Requires<AspNetAuthBasicPackage, CrisAspNetAuthPackage>]
[Requires<NamedUser.UserProfileNamedUserPackage>]
[Requires<PreferredCulture.UserProfilePreferredCulturePackage>]
[Requires<UserPassword.UserProfilePasswordPackage>]
[Requires<UserPassword.Lost.UserProfilePasswordLostPackage>]
[Requires<UserPassword.Reset.UserProfilePasswordResetPackage>]
[Requires<Workspace.UserProfileWorkspacePackage>]
// LOCAL TEST ONLY, to be removed with the "Ban me" button of Res/private-page.t: the command it
// sends is not registered anywhere else in this sample, so it would not reach the ck-gen.
[RegisterTypeScriptType( typeof( ISetUserBannedCommand ) )]
public class UserProfileSamplePackage : TypeScriptPackage
{
}
