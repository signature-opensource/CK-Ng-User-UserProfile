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
| [`user-profile-page.ts`](UserProfile/Res/user-profile-page.ts) | `DependencyInjection`, `LocalVariables`, `AvatarFallbackComputing`, plus the single points `AvatarImgSrcComputing`, `ComputeAvatarSize`, `PublicMethods` and the wrapped region `PrivateMethods` |
| [`user-update-form.ts`](UserUpdateForm/Res/user-update-form.ts) | `ViewChildren`, `DependencyInjection`, `InputOutput`, `IconsDefinition`, `LocalVariables`, `UpdateUserBatchCommand`, `SetUserNameCommandRegistering`, `CancelModifications`, `UserNameReset`, `UserIdentityFormControlDefinition`, `UserPreferencesFormControlDefinition`, `UserNameFormControlDefinition`, and their `...Registration` counterparts |
| [`user-service.ts`](Res/user-service.ts) | `DependencyInjection`, `LocalVariables`, `UserProfileRefresh` |

Most anchors exist as a `Pre`/`Post` pair, and `revert` on the `Pre` half means the injected fragments
are emitted in reverse dependency order. Not all: `AvatarImgSrcComputing`, `ComputeAvatarSize` and
`PublicMethods` are single insertion points, and `PrivateMethods` is a wrapped region with an opening
and a closing marker.

### The guard array of the private page is one of them.

[`Res/AppRoutes.t`](Res/AppRoutes.t) puts two properties on the private page route, and the second is
deliberately empty:

```
,
runGuardsAndResolvers: 'always',
canActivate: []
```

A package of this family that needs a navigation guard **appends** into that array and never creates
it:

```
insert "<theirGuard>, " after single "canActivate: [";
```

The reason it is owned here rather than by each guard is that the route is a plain object literal:
two packages emitting their own `canActivate` would give it that property twice, and TypeScript
rejects that outright - `TS1117: An object literal cannot have multiple properties with the same name`.
Appending is the only shape in which several guards can coexist, and creating the array upstream is
what lets the appending packages depend on **this** one instead of on each other, in any number and in
any order.

`runGuardsAndResolvers: 'always'` ships with it because an appended guard needs it and should not have
to know so: `canActivate` alone does not re-run while the private page is retained - the case of a
navigation back to `""` from inside the private area, the "go to home" of a logo. An application that
appends nothing pays nothing: the array is empty and the private page carries no resolver.

### What a package extending this one writes.

No worked example here, deliberately: every package that consumes these anchors is downstream of this
one, and showing one would put in front of the reader a type that referencing this package does not
give them. The mechanism itself is short.

An extending package writes no subclass. It drops a `.t` transformer in its own `Res/`, named after the
file it transforms, and either injects into one of the anchors tabulated above -
`inject """ ... """ into <AnchorName>;` - or navigates the target's syntax where no anchor sits where it
needs one (`insert ... after *`, or `in after "@Component"` then `in first {^braces}`). One file carries
one transformer per target language, `<ts>`, `<html>` and `<less>`, and the two mechanisms are available
in any of them.

An injected fragment may publish anchors of its own, wrapped in its own `Pre`/`Post` pair, so an
extending package becomes an extension point in turn. That is how the batch command described above
stays open: a fragment injected at `PostSetUserNameCommandRegistering` pushes into `batchCmd.commands`
rather than sending a command of its own.

## A note on CK.Cris.SimpleBatch.

The [`CK.Cris.SimpleBatch/`](CK.Cris.SimpleBatch) folder declares `ICommandSimpleBatch`,
`ISimpleBatchCommandResultPart` and `IUpdateUserCommand` in the `CK.Cris` and `CK.IO.Actor`
namespaces - not in this package namespace. It is a staging area: the code comments say as much
(*"Will disappear once we have [Abstract], [Virtual], [Primary], [Secondary]"*), and `ITestBatchCommand`
/ `ITestCommand` next to them are scaffolding, not API. Expect this folder to move to CK-Cris; do not
build on the test interfaces.
