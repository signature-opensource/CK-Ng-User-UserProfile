using CK.Core;
using CK.IO.UserProfile.Workspace;
using CK.TypeScript;

namespace CK.Ng.UserProfile.Workspace;

[TypeScriptPackage]
[Requires<UserProfilePackage>]
[RegisterTypeScriptType( typeof( ISetPreferredWorkspaceIdCommand ) )]
public class UserProfileWorkspacePackage : TypeScriptPackage
{
}
