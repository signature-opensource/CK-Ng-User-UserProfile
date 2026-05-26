using CK.Core;
using CK.IO.Actor;
using CK.Ng.Cris.AspNet.Auth;
using CK.Ng.Localization;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile;

[TypeScriptPackage]
[Requires<LocalizationPackage, CrisAspNetAuthPackage>]
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
