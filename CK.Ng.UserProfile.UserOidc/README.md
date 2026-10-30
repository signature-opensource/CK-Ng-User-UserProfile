# CK.Ng.UserProfile.UserOidc

Angular CKomposable package that adds the OpenID Connect section ("Linked accounts") to the "Sign-in
methods" tab of the `/profile` page brought by [CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md).

## What it brings.

| | |
|---|---|
| Component | [`OidcIdentitiesComponent`](OidcIdentities/OidcIdentitiesComponent.cs) (`ck-oidc-identities`) |
| Transformer | [`sign-in-methods.t`](Res/sign-in-methods.t) injects the section at `PostSignInMethodsSections` |
| Translations | the `CK.UserProfile.Oidc.*` keys |

| Element | Command | Level |
|---|---|---|
| The identities: the provider (and the logo of its login button, `login-providers/<name>.png`), the account at the provider (the `email` claim, else `preferred_username`, else `name`), the last sign-in | `IGetOidcIdentitiesQCommand` | Normal |
| What the provider shared: the claims of the last sign-in, an expandable detail | (the same) | Normal |
| Unlink (with a confirmation) | `IUnlinkOidcIdentityCommand` | Critical, not while impersonating |
| Link another provider (the OpenID Connect schemes the user has no identity for) | `AuthService.startPopupBinding( scheme )` | Critical, not while impersonating |

Linking is a remote login in a popup that binds the identity to the user instead of signing in
(`IStartLoginCommand.BindToCurrentActor`): the session is unchanged. The authentication center refuses
an identity already used by another user; the server refuses to unlink the user's last sign-in method.
Below the Critical level, the section offers to sign in again (`NgAuthService.navigateToCriticalLogin()`)
when one of the user's methods can elevate it.

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.UserOidc` (the commands, handled by `CK.DB.User.UserOidc` where the database is)
