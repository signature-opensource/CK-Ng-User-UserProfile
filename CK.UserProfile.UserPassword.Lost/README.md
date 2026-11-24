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
| Mail | [`IPasswordLostMailer`](Mail/IPasswordLostMailer.cs) and its default implementation, the Fluid templates of [Res/Templates](Res/Templates) |
| Translations | [`Res/locales`](Res/locales) for the back-end `UserMessage` answers - see below |
| Option | [`PasswordLostOption`](PasswordLostOption.cs): the "PasswordLost" option of the AuthCenter - see below |

The handler is an auto service, found when this assembly is in the application: an application that
references this project but uses none of its types keeps the reference with
`[assembly: CK.Setup.PreserveAssemblyReference( typeof( PasswordLostCommandHandler ) )]` (the compiler
drops an unused reference).

## Requires.

- `CK.IO.UserProfile.UserPassword.Lost` (the commands), `CK.IO.User.UserPassword` (the
  `ISetPasswordCommand` the recover handler emits), `CK.Cris.Executor`.
- `CK.DB.Actor.ActorEMail`, `CK.DB.User.NamedUser`, `CK.SqlServer.Dapper`, `CK.Mailer.MailKit`,
  `CK.Mail.SharedLayout`, `CK.Template.Fluid`, `CK.AppIdentity.AuthCenter.Local` (the owner of its option),
  `CK.Globalization.StObj`, `Microsoft.AspNetCore.DataProtection.Extensions`.

## The "PasswordLost" option of the AuthCenter.

The flow and its policy are an option of the Authentication Center, where the users are
([`PasswordLostOption`](PasswordLostOption.cs), see
[the options of the party components](https://github.com/signature-opensource/CK-AppIdentity/blob/stable/CK.AppIdentity/PartyComponentOptions/README.md)).
It is enabled by default: referencing this package brings the flow.

```jsonc
"Local": {
  "AuthCenter": {
    "PasswordLost": {
      "TokenLifetime": "02:00:00", // The default: how long a recovery link stays valid.
      "Sender": "Support"          // Optional: the sender of the mails, the default sender of the party when absent.
    }
  }
}
```

- **`"PasswordLost": false` turns the flow off:** no recovery mail is sent (the anonymous command answers the same, it
  doesn't disclose it either) and a recovery link is refused. An application that is not an Authentication Center has
  no flow.
- **Only with "Password" and "MailSender":** the option requires the "Password" option of the AuthCenter
  ([CK.AppIdentity.AuthCenter.Password](https://github.com/signature-opensource/CK-AppIdentity-Transport/blob/stable/CK.AppIdentity.AuthCenter.Password/README.md):
  no password, nothing to recover) and the "MailSender" feature of the party (the recovery mail). Without them it is
  disabled (an information is logged); `"PasswordLost": true` (or its section) without them is a configuration error.
- **`TokenLifetime`** should be kept short: a token that has not been used stays valid until it expires. The mails
  render this duration.
- **`Sender`** names a sender of the "MailSender" feature of the Authentication Center party (see
  [CK.Mailer](https://github.com/signature-opensource/CK-Mailer/blob/stable/CK.Mailer/README.md)): the mails are sent with
  it (its `From` address). An unknown sender fails the sending of the mail, not the setup.
- An invalid value (an unknown key, a `TokenLifetime` that is not a positive `TimeSpan`) fails the setup of the party.

## The two commands are anonymous, and one of them must stay silent.

The commands are declared by
[CK.IO.UserProfile.UserPassword.Lost](../CK.IO.UserProfile.UserPassword.Lost/README.md).

`ISendForgotPasswordEmailCommand` takes an e-mail address and is reachable without authentication.
**Its result must not disclose whether the address is known**: the same message is returned in all
cases. Any change to that handler has to preserve this - an endpoint that answers differently for a
known address is an account enumeration oracle.

`IRecoverPasswordCommand` takes the token and the new password. The token is the only proof of
identity, which is why it is generated through `Microsoft.AspNetCore.DataProtection` and carries its
own validity - announced in the mail body. **It is single use, without storage:** it carries a fingerprint
of the user's current password hash and is accepted only while the password is unchanged, so the recovery
kills it, and so does any other password change. **It is bound to the party through which the user acts**
(the caller party of the command, `AuthenticationInfo.CallerPartyFullName`): it is redeemed only through this party.

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
**The links target the client application of the party through which the user acts**: the URL that this party
states about itself (its description, see
[CK.AppIdentity](https://github.com/signature-opensource/CK-AppIdentity/blob/stable/CK.AppIdentity/README.md#the-description-of-a-party):
its public URL and its client applications), never the request (a link built from the `Host` header of a request is the
password reset poisoning attack). The models give `ClientUrl` (the default client application) and `ClientUrls` (by
name): a template that targets another client application uses `{{ clientUrls.Name }}`. When the party has no client
application URL, no mail is sent and an error is logged; the anonymous command answers the same.
