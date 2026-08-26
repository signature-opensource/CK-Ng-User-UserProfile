# CK.Ng.UserProfile.Workspace

Angular CKomposable package that adds the preferred workspace to the `/profile` page brought by
[CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md).

## What it brings.

- The preferred workspace displayed on the profile page.
- A form control on the update form, and the `SetPreferredWorkspaceIdCommand` pushed into the profile
  update batch.
- The workspaces the user belongs to, exposed by `user-service.ts` as `GroupInfos` and refreshed with
  the profile.

No component of its own: this package is only [transformers](Res) plus a translation key.

## Requires.

- [`UserProfilePackage`](../CK.Ng.UserProfile/README.md)
- `CK.IO.UserProfile.Workspace` for `ISetPreferredWorkspaceIdCommand`

## Transformers.

| Target of the base package | File | Anchors used |
|---|---|---|
| `user-profile-page.html` / `.ts` | [user-profile-page.t](Res/user-profile-page.t) | `PostProfilePropsRegistration`, `PostLocalVariables` |
| `user-update-form.ts` | [user-update-form.t](Res/user-update-form.t) | `PreUserPreferencesFormControlDefinition`, `PreUserPreferencesFormControlRegistration`, `PostSetUserNameCommandRegistering`, `PostUserNameReset` |
| `user-service.ts` | [user-service.t](Res/user-service.t) | `PostLocalVariables`, `PostUserProfileRefresh` |

`PreUserPreferencesFormControlDefinition` and `PreUserPreferencesFormControlRegistration` are shared
anchors: any other package adding a user preference injects there too. The `revert` on them is what
keeps the order deterministic when several packages do.

## Translations.

`CK.UserProfile.PreferredWorkspace`, in [default.jsonc](Res/ts-locales/default.jsonc). There is no
`fr.jsonc` in this package yet - the French label falls back to the default text.
