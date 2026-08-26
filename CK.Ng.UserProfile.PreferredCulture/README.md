# CK.Ng.UserProfile.PreferredCulture

Angular CKomposable package that adds the preferred language to the `/profile` page brought by
[CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md).

## What it brings.

- The language displayed on the profile page, resolved to its native name from the generated
  `ts-locales/locales` set.
- A form control on the update form, and the `SetUserExtendedCultureCommand` pushed into the profile
  update batch.
- **A side effect on the whole application**: it transforms `user-service.ts` so that, whenever the
  user profile is loaded or refreshed, the Cris `currentCultureName` ambient value and the
  ngx-translate current language are switched to the user preferred culture. Referencing this package
  therefore makes the UI follow the stored preference, not only display it.

No component of its own: this package is only [transformers](Res) plus a translation key.

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.PreferredCulture` for `ISetUserExtendedCultureCommand`

## Transformers.

| Target of the base package | File | Anchors used |
|---|---|---|
| `user-profile-page.html` / `.ts` | [user-profile-page.t](Res/user-profile-page.t) | `PostProfilePropsRegistration`, `PostLocalVariables` |
| `user-update-form.ts` | [user-update-form.t](Res/user-update-form.t) | `PreViewChildren`, `PreUserPreferencesFormControlDefinition`, `PreUserPreferencesFormControlRegistration`, `PostSetUserNameCommandRegistering`, `PostCancelModifications` |
| `user-service.ts` | [user-service.t](Res/user-service.t) | `PreDependencyInjection`, `PostUserProfileRefresh` |

## Translations.

`CK.UserProfile.PreferredCultureName` ("Language"), in
[default.jsonc](Res/ts-locales/default.jsonc) and [fr.jsonc](Res/ts-locales/fr.jsonc).
