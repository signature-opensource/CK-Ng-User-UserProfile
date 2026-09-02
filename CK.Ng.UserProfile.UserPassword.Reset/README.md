# CK.Ng.UserProfile.UserPassword.Reset

Angular CKomposable package that brings the temporary password flow: as long as
`IUserProfile.IsTemporaryPassword` is true, every private page is forbidden to the user until it has
chosen a real password.

This package has **no dependency on the e-mail feature**: the user is already authenticated, so nothing
has to be sent anywhere.

## What it brings.

| | |
|---|---|
| Route | `/auth/reset-password` - [`ResetPasswordFormComponent`](ResetPassword/ResetPasswordFormComponent.cs), a lazy child of `AuthenticationPageComponent` |
| Guards | [`temporary-password-guard.ts`](Res/temporary-password-guard.ts) (`temporaryPasswordGuard`), [`reset-password-page-guard.ts`](Res/reset-password-page-guard.ts) (`resetPasswordPageGuard`, `RESET_PASSWORD_URL`) |
| Command | `ISetPasswordCommand` |
| Transformers | [`AppRoutes.t`](Res/AppRoutes.t), [`AuthRoutes.t`](Res/AuthRoutes.t) |
| Translations | [default.jsonc](ResetPassword/Res/ts-locales/default.jsonc), [fr.jsonc](ResetPassword/Res/ts-locales/fr.jsonc) |

## Requires.

- [`UserProfilePasswordPackage`](../CK.Ng.UserProfile.UserPassword/README.md)
- `INgPrivatePageComponent` - `AppRoutes.t` anchors on the `children: rPrivatePage` of the generated
  routes, so the private page must be in the graph. Nothing else expresses that dependency, since the
  reset form itself left the private page for the authentication page.
- `CK.Ng.AspNet.Auth`, `CK.IO.User.UserPassword.Reset`

## Why the reset page is not under the private page.

The page carries no token: the user is already authenticated, only the temporary state of its password
is at stake. It is nonetheless a child of the authentication page at `/auth/reset-password`, because
the only thing the user can do there is choose a password - the application shell of the private page
would offer navigations that `temporaryPasswordGuard` immediately undoes.

Being outside the private page, it loses the `canMatch` that guarded it against anonymous access.
`resetPasswordPageGuard` takes that over, registered on the route itself by `AuthRoutes.t`.

## How the two guards are wired.

[`AppRoutes.t`](Res/AppRoutes.t) appends `temporaryPasswordGuard` into the `canActivate` array of the
private page - one line, and nothing else:

```
insert "temporaryPasswordGuard, " after single "canActivate: [";
```

The array itself, and the `runGuardsAndResolvers: 'always'` that makes an appended guard re-run, are
emitted upstream by [`CK.Ng.UserProfile`](../CK.Ng.UserProfile/README.md) - see its
[`Res/AppRoutes.t`](../CK.Ng.UserProfile/Res/AppRoutes.t) for why they are owned there. This package
neither creates them nor needs to know which other packages append beside it.

Both properties still matter to the guard, and a failing test covers dropping either one -
`integration.spec.ts`, *"registers temporaryPasswordGuard as the canActivate of the private page,
re-run on every navigation"*. It asserts with `toContain`, precisely so that other guards may share the
array:

- `canActivate` alone would not re-run while the private page is retained - which is exactly the case
  of a navigation back to `""` from inside the private area, the "go to home" of a logo.
- `runGuardsAndResolvers: 'always'` lifts that restriction. The private page carries no resolver, so
  re-running costs a signal read.

`canActivateChild` is deliberately not set: with `'always'`, the parent guard already runs on every
navigation of the subtree, including from one child to another.

The redirection target being a sibling of the private page rather than one of its children, it cannot
loop.

[`AuthRoutes.t`](Res/AuthRoutes.t) anchors on the tail of the lazy registration the engine writes for
the reset page (`c.ResetPasswordForm )`) - the class name is what makes that anchor unambiguous, since
every other page registered under the authentication page is emitted in exactly the same shape.
