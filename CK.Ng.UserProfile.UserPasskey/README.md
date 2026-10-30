# CK.Ng.UserProfile.UserPasskey

Angular CKomposable package that adds the passkey section to the "Sign-in methods" tab of the
`/profile` page brought by [CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md): the user lists,
renames, deletes and adds its passkeys.

## What it brings.

| | |
|---|---|
| Component | [`PasskeyListComponent`](PasskeyList/PasskeyListComponent.cs) (`ck-passkey-list`) |
| Transformer | [`sign-in-methods.t`](Res/sign-in-methods.t) injects the section at `PostSignInMethodsSections` |
| Translations | the `CK.UserProfile.Passkeys.*` keys |

| Element | Command | Level |
|---|---|---|
| The list (name, model, synchronized, created, last used) | `IGetPasskeysQCommand` | Normal |
| Rename (inline, not blank, 128 characters at most) | `IRenamePasskeyCommand` | Normal |
| Delete (with a confirmation) | `IDeletePasskeyCommand` | Critical, not while impersonating |
| Add (an optional name next to the registration button) | the `ck-passkey-registration-button` of `CK.Ng.Cris.AspNet.Authentication.Passkey` | Critical, not while impersonating |

Below the Critical level, the section offers to sign in again (`NgAuthService.navigateToCriticalLogin()`)
when one of the user's methods can elevate it. The server refuses the deletion of the user's last
sign-in method: its message is displayed. The model is the authenticator's AAGUID, in a short form (a
name table of the authenticators is out of scope).

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.UserPasskey` (the commands, handled by `CK.DB.User.UserPasskey` where the database is)
- `CK.Ng.Cris.AspNet.Authentication.Passkey` (the registration button and the passkey HTTP front)
