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
| Commands | [`ISendForgotPasswordEmailCommand`](Commands/ISendForgotPasswordEmailCommand.cs), [`IRecoverPasswordCommand`](Commands/IRecoverPasswordCommand.cs) - **both anonymous by design** |
| Server side | [`PasswordLostCommandHandler`](PasswordLostCommandHandler.cs), [`PasswordLostTokenService`](PasswordLostTokenService.cs), [`PasswordLostQueries`](PasswordLostQueries.cs) |
| Mail | [`IPasswordLostMailer`](Mail/IPasswordLostMailer.cs) and its default implementation, [`IFrontUrlResolver`](Mail/IFrontUrlResolver.cs), the Fluid templates of [Res/Templates](Res/Templates) |
| Transformer | [`basic-login-form.t`](PasswordLost/Res/basic-login-form.t) injects the "Forgot your password?" link into the login form |
| Translations | `Res/ts-locales` for the components (ngx-translate, browser side) and `Res/locales` for the back-end `UserMessage` answers - see below |

## Requires.

- [`UserProfilePasswordPackage`](../CK.Ng.UserProfile.UserPassword/README.md)
- `CK.Ng.AspNet.Auth.Basic` (the login form this package extends), `CK.IO.User.UserPassword`
- On the server: `CK.DB.Actor.ActorEMail`, `CK.DB.User.NamedUser`, `CK.SqlServer.Dapper`,
  `CK.Mailer.MailKit`, `CK.Mail.SharedLayout`, `CK.Template.Fluid`, `CK.AppIdentity.Abstractions`,
  `CK.Globalization.StObj`, `Microsoft.AspNetCore.DataProtection`

## The two commands are anonymous, and one of them must stay silent.

`ISendForgotPasswordEmailCommand` takes an e-mail address and is reachable without authentication.
**Its result must not disclose whether the address is known**: the same message is returned in all
cases. Any change to that handler has to preserve this - an endpoint that answers differently for a
known address is an account enumeration oracle.

`IRecoverPasswordCommand` takes the token and the new password. The token is the only proof of
identity, which is why it is generated through `Microsoft.AspNetCore.DataProtection` and carries its
own validity - announced in the mail body.

## Two translation sets, for two different consumers.

This trips people up, so it is worth stating plainly:

- `Res/ts-locales/*.jsonc` (under each component folder) feed **ngx-translate in the browser**.
- [`Res/locales/*.jsonc`](Res/locales) are registered by
  [`PasswordLostLocalePackage`](PasswordLostLocalePackage.cs) (`[Globalization.LocalePackage]`) and
  translate the **back-end answers**, which travel as `UserMessage` - a resource name plus an English
  fallback text - and are resolved server-side from the command current culture.

The mail templates are a third set: [Res/Templates](Res/Templates) holds
`PasswordLost.{Subject|Body}.{en|fr}.liquid` and `PasswordSetConfirmation.{Subject|Body}.{en|fr}.liquid`.

## Overriding the mails.

[`IPasswordLostMailer`](Mail/IPasswordLostMailer.cs) offers two override points, and they are not
equivalent:

- **Content only** - declare a `[FluidTemplatePackage]` and embed a
  `Res/Templates/PasswordLost.{Subject|Body}.{culture}.liquid` under the same logical name. The
  consumer registration wins over the default one.
- **Whole behaviour** - provide another `IPasswordLostMailer` and substitute it with
  `[ReplaceAutoService]`.

Reach for the first one to reword or rebrand; the second only when the dispatch itself has to change.
The link root comes from `IFrontUrlResolver` ([default implementation](Mail/DefaultFrontUrlResolver.cs)),
so a deployment with a front-end on another host overrides that single service rather than the mailer.
