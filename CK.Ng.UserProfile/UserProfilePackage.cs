using CK.Core;
using CK.IO.Actor;
using CK.Ng.AspNet.Auth;
using CK.Ng.Cris.AspNet;
using CK.Ng.Localization;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile;

[TypeScriptPackage]
[Requires<LocalizationPackage, AspNetAuthPackage, CrisAspNetPackage>]
[TypeScriptFile( "user-service.ts", "UserService" )]
[NgProviderImport( "UserService" )]
[NgProviderImport( "provideAppInitializer", From = "@angular/core" )]
[NgProvider( "provideAppInitializer( () => { inject( UserService ); } )" )]
[RegisterTypeScriptType( typeof( IUpdateUserCommand ) )]
[RegisterTypeScriptType( typeof( ISetUserNameCommand ) )]
[RegisterTypeScriptType( typeof( IGetUserProfileQCommand ) )]
public class UserProfilePackage : TypeScriptPackage
{
}
