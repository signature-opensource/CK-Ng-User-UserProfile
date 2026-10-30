# CK.Ng.UserProfile.UserPassword.Lost

Angular CKomposable package that brings the lost password flow: the anonymous "password lost" page
that asks for an e-mail, and the "recover password" page reached through the link sent by e-mail.

This is the only satellite of
[CK.Ng.UserProfile.UserPassword](../CK.Ng.UserProfile.UserPassword/README.md) that depends on the
e-mail feature - consumers that do not want it simply do not reference this package.

## What it brings.

| | |
|---|---|
| Routes | `/auth/password-lost` - [`PasswordLostFormComponent`](PasswordLost/PasswordLostFormComponent.cs) · `/auth/recover-password/:token` - [`RecoverPasswordFormComponent`](RecoverPassword/RecoverPasswordFormComponent.cs). Both lazy children of `AuthenticationPageComponent`. |
| Commands | The pages send [`ISendForgotPasswordEmailCommand`](../CK.IO.UserProfile.UserPassword.Lost/ISendForgotPasswordEmailCommand.cs) and [`IRecoverPasswordCommand`](../CK.IO.UserProfile.UserPassword.Lost/IRecoverPasswordCommand.cs) - **both anonymous by design** |
| Transformer | [`basic-login-form.t`](PasswordLost/Res/basic-login-form.t) injects the "Forgot your password?" link into the login form |
| Translations | the `Res/ts-locales` of the components (ngx-translate, browser side) |

## The server side.

The commands are handled by [CK.UserProfile.UserPassword.Lost](../CK.UserProfile.UserPassword.Lost/README.md)
(the handler, the recovery token, the mails), where the database is. This package doesn't bring it: a
front without a database gets no database objects. A single-process application (its own
authentication center) references both.

## Requires.

- [`UserProfilePasswordPackage`](../CK.Ng.UserProfile.UserPassword/README.md)
- `CK.Ng.Cris.AspNet.Authentication.Basic` (the login form this package extends),
  [`CK.IO.UserProfile.UserPassword.Lost`](../CK.IO.UserProfile.UserPassword.Lost/README.md)
