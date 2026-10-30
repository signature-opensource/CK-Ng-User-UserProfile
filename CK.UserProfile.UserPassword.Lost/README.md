# CK.UserProfile.UserPassword.Lost

Server side of the lost password flow: the handler of the two anonymous commands of
[CK.IO.UserProfile.UserPassword.Lost](../CK.IO.UserProfile.UserPassword.Lost/README.md), the recovery
token and the e-mails that carry it. It runs where the database is: in the authentication center of a
distributed application. The front only has the pages
([CK.Ng.UserProfile.UserPassword.Lost](../CK.Ng.UserProfile.UserPassword.Lost/README.md)) and their
commands reach this handler by location transparency.

## What it brings.

| | |
|---|---|
| Handler | [`PasswordLostCommandHandler`](PasswordLostCommandHandler.cs), [`PasswordLostTokenService`](PasswordLostTokenService.cs), [`PasswordLostQueries`](PasswordLostQueries.cs) |
| Mail | [`IPasswordLostMailer`](Mail/IPasswordLostMailer.cs) and its default implementation, [`IFrontUrlResolver`](Mail/IFrontUrlResolver.cs), the Fluid templates of [Res/Templates](Res/Templates) |
| Translations | [`Res/locales`](Res/locales) for the back-end `UserMessage` answers - see below |

The handler is an auto service, found when this assembly is in the application: an application that
references this project but uses none of its types keeps the reference with
`[assembly: CK.Setup.PreserveAssemblyReference( typeof( PasswordLostCommandHandler ) )]` (the compiler
drops an unused reference).

## Requires.

- `CK.IO.UserProfile.UserPassword.Lost` (the commands), `CK.IO.User.UserPassword` (the
  `ISetPasswordCommand` the recover handler emits), `CK.Cris.Executor`.
- `CK.DB.Actor.ActorEMail`, `CK.DB.User.NamedUser`, `CK.SqlServer.Dapper`, `CK.Mailer.MailKit`,
  `CK.Mail.SharedLayout`, `CK.Template.Fluid`, `CK.AppIdentity.Abstractions`, `CK.Globalization.StObj`,
  `Microsoft.AspNetCore.DataProtection.Extensions`.

## The two commands are anonymous, and one of them must stay silent.

The commands are declared by
[CK.IO.UserProfile.UserPassword.Lost](../CK.IO.UserProfile.UserPassword.Lost/README.md).

`ISendForgotPasswordEmailCommand` takes an e-mail address and is reachable without authentication.
**Its result must not disclose whether the address is known**: the same message is returned in all
cases. Any change to that handler has to preserve this - an endpoint that answers differently for a
known address is an account enumeration oracle.

`IRecoverPasswordCommand` takes the token and the new password. The token is the only proof of
identity, which is why it is generated through `Microsoft.AspNetCore.DataProtection` and carries its
own validity - announced in the mail body.

## Two translation sets, for two different consumers.

This trips people up, so it is worth stating plainly:

- [`Res/locales/*.jsonc`](Res/locales) are registered by
  [`PasswordLostLocalePackage`](PasswordLostLocalePackage.cs) (`[Globalization.LocalePackage]`) and
  translate the **back-end answers**, which travel as `UserMessage` - a resource name plus an English
  fallback text - and are resolved server-side from the command current culture.
- The `Res/ts-locales/*.jsonc` of the pages (in
  [CK.Ng.UserProfile.UserPassword.Lost](../CK.Ng.UserProfile.UserPassword.Lost/README.md)) feed
  **ngx-translate in the browser**.

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

The class a consumer declares is three lines, and its only job is to be found:

```csharp
using CK.Template.Fluid;

[FluidTemplatePackage]
public sealed class MyMailTemplatesPackage : FluidTemplatePackage
{
}
```

The templates go anywhere under a `Res/Templates/` path in the same assembly - discovery walks the
loaded assemblies looking for that path, so the class need not sit beside them. This package is its own
illustration: the declaration is in `Mail/`, the templates at the package root.

```
Res/Templates/PasswordLost.Subject.en.liquid
Res/Templates/PasswordLost.Body.en.liquid
Res/Templates/PasswordLost.Subject.fr.liquid
Res/Templates/PasswordLost.Body.fr.liquid
```

The **logical name is the filename minus its culture suffix and `.liquid`** - the culture is matched
separately, which is why the mailer asks for `RenderAsync( "PasswordLost.Subject", culture, model )`.
So `Subject`/`Body` are not free, and the culture suffix is what selects between your translations.
This package ships that set plus the `PasswordSetConfirmation.*` four, which is the list to copy from
when overriding.

⚠️ **There is no precedence rule.** Registration is a plain dictionary assignment per culture, over an
`AppDomain.CurrentDomain.GetAssemblies()` walk, so the **last assembly walked wins** and no conflict is
reported. A consumer's template replaces the default because it registers under the same key, not
because consumers outrank packages. It works in practice, but do not read it as a guarantee: two
packages overriding the same template is silently order-dependent.

Its own declaration, [`PasswordLostMailTemplatesPackage`](Mail/PasswordLostMailTemplatesPackage.cs),
states the intent in its summary: *"A consumer can override the content by declaring its own
`[FluidTemplatePackage]` carrying a template with the same logical name."*

Reach for the first one to reword or rebrand; the second only when the dispatch itself has to change.
The link root comes from `IFrontUrlResolver` ([default implementation](Mail/DefaultFrontUrlResolver.cs)),
so a deployment with a front-end on another host overrides that single service rather than the mailer.
