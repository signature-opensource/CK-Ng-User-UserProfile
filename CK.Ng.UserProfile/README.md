# CK.Ng.UserProfile

Angular CKomposable package that brings the `/profile` page. At this level, the page displays the user
name and lets the user change it.

Everything else - names, preferred culture, workspace, password - is added by a satellite package that
transforms the files below. This package owns the anchors; it does not know its satellites.

## What it brings.

| | |
|---|---|
| Route | `/profile`, as a child of `INgPrivatePageComponent` - see [`UserProfilePageComponent`](UserProfile/UserProfilePageComponent.cs) |
| Components | [`UserProfilePageComponent`](UserProfile/UserProfilePageComponent.cs), [`UserUpdateFormComponent`](UserUpdateForm/UserUpdateFormComponent.cs) (built on `Zorro.GenericFormComponent`) |
| Service | [`user-service.ts`](Res/user-service.ts) - exposes the `userProfile()` signal; registered through `provideAppInitializer` so it loads once at startup |
| Commands | `IUpdateUserCommand`, `ISetUserNameCommand`, `IGetUserProfileQCommand` |
| Translations | [`ts-locales/default.jsonc`](UserProfile/Res/ts-locales/default.jsonc) and `fr.jsonc`, under the `CK.UserProfile.*` key prefix |

`UserProfilePageComponent` declares `[OptionalRequires<INgUserInfoBoxComponent>]`: the avatar box is
used when the application provides one, and the page works without it.

## Requires.

- `CK.IO.Actor` for the command definitions, `CK.Ng.Cris.AspNet.Auth`, and `CK.Ng.Zorro.Basic` which
  supplies the `Zorro.GenericFormComponent` that `UserUpdateFormComponent` is built on.
- [`UserProfilePackage`](UserProfilePackage.cs) also declares
  `[Requires<LocalizationPackage, CrisAspNetAuthPackage>]`: the localization package is a composition
  requirement, satisfied transitively rather than by a reference of its own.

## The form sends one batch command.

`UserUpdateFormComponent` does not send one command per changed field. It builds a single
`UpdateUserCommand` - an `ICommandSimpleBatch` - and each satellite pushes its own sub-command into
`batchCmd.commands` at the `<PostSetUserNameCommandRegistering>` anchor. One round trip, and the
server applies the whole set or reports per-command results.

## Extension points.

The satellites do not subclass anything: they inject into named anchors of the base files with `.t`
transformers. The anchors are the actual contract of this package, so renaming one breaks every
satellite.

| File | Anchors |
|------|---------|
| [`user-profile-page.html`](UserProfile/Res/user-profile-page.html) | `ProfilePropsRegistration`, `UserProfileTabsRegistration`, `UserProfileGeneralInfosTab` |
| [`user-profile-page.ts`](UserProfile/Res/user-profile-page.ts) | `DependencyInjection`, `LocalVariables`, `AvatarFallbackComputing` |
| [`user-update-form.ts`](UserUpdateForm/Res/user-update-form.ts) | `ViewChildren`, `DependencyInjection`, `InputOutput`, `IconsDefinition`, `LocalVariables`, `UpdateUserBatchCommand`, `SetUserNameCommandRegistering`, `CancelModifications`, `UserNameReset`, `UserIdentityFormControlDefinition`, `UserPreferencesFormControlDefinition`, and their `...Registration` counterparts |
| [`user-service.ts`](Res/user-service.ts) | `DependencyInjection`, `LocalVariables`, `UserProfileRefresh` |

Each anchor exists as a `Pre`/`Post` pair; `revert` on the `Pre` half means the injected fragments are
emitted in reverse dependency order.

## A note on CK.Cris.SimpleBatch.

The [`CK.Cris.SimpleBatch/`](CK.Cris.SimpleBatch) folder declares `ICommandSimpleBatch`,
`ISimpleBatchCommandResultPart` and `IUpdateUserCommand` in the `CK.Cris` and `CK.IO.Actor`
namespaces - not in this package namespace. It is a staging area: the code comments say as much
(*"Will disappear once we have [Abstract], [Virtual], [Primary], [Secondary]"*), and `ITestBatchCommand`
/ `ITestCommand` next to them are scaffolding, not API. Expect this folder to move to CK-Cris; do not
build on the test interfaces.
