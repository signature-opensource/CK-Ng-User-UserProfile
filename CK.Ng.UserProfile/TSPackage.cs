using CK.Core;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile;

[TypeScriptPackage]
[Requires<Zorro.GenericFormComponent, Localization.TSPackage, AspNet.Auth.TSPackage, Cris.AspNet.TSPackage>]
[TypeScriptFile( "user.service.ts", "UserService" )]
[NgProviderImport( "UserService" )]
[NgProviderImport( "provideAppInitializer", LibraryName = "@angular/core" )]
[NgProvider( "provideAppInitializer( () => { inject( UserService ); } )" )]
public class TSPackage : TypeScriptPackage
{
}
