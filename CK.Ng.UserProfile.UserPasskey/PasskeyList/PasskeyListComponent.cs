using CK.Core;
using CK.IO.User.UserPasskey;
using CK.Ng.Cris.AspNet.Authentication.Passkey;
using CK.TS.Angular;
using CK.TypeScript;

namespace CK.Ng.UserProfile.UserPasskey;

/// <summary>
/// The passkey section: the user's passkeys (<see cref="IGetPasskeysQCommand"/>), renamed inline
/// (<see cref="IRenamePasskeyCommand"/>), deleted (<see cref="IDeletePasskeyCommand"/>: a recent login, not while
/// impersonating, never the last sign-in method) and added (the registration button, with an optional name).
/// </summary>
[NgComponent]
[Package<UserProfilePasskeyPackage>]
[Requires<PasskeyRegistrationButtonComponent>]
[RegisterTypeScriptType( typeof( IGetPasskeysQCommand ) )]
[RegisterTypeScriptType( typeof( IRenamePasskeyCommand ) )]
[RegisterTypeScriptType( typeof( IDeletePasskeyCommand ) )]
public sealed class PasskeyListComponent : NgComponent
{
}
