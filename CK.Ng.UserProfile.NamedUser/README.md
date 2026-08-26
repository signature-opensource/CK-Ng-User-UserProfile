# CK.Ng.UserProfile.NamedUser

Angular CKomposable package that adds the first name and last name to the `/profile` page brought by
[CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md).

## What it brings.

- Two read-only properties on the profile page and two form controls on the update form.
- The `SetUserNamesCommand` pushed into the profile update batch - and only when a value actually
  changed, each field being sent as `null` when untouched.
- An avatar fallback: the initials computed from the first and last names, when the application
  displays a user info box.

No component, no service of its own: this package is only
[transformers](Res) plus [translations](Res/ts-locales/default.jsonc).

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.User.NamedUser` for `ISetUserNamesCommand`

## Transformers.

| Target of the base package | File | Anchors used |
|---|---|---|
| `user-profile-page.html` / `.ts` | [user-profile-page.t](Res/user-profile-page.t) | `PreProfilePropsRegistration`, `PreAvatarFallbackComputing` |
| `user-update-form.ts` | [user-update-form.t](Res/user-update-form.t) | `PostUserIdentityFormControlDefinition`, `PostUserIdentityFormControlRegistration`, `PostSetUserNameCommandRegistering`, `PostUserNameReset` |
| `user-info-box` | [user-info-box.t](Res/user-info-box.t) | `PreDependencyInjection`, `PreAvatarFallbackComputing` |

## Translations.

`CK.UserProfile.FirstName`, `CK.UserProfile.LastName` and their
`CK.UserProfile.Form.*.Placeholder` counterparts, in
[default.jsonc](Res/ts-locales/default.jsonc) and [fr.jsonc](Res/ts-locales/fr.jsonc).
