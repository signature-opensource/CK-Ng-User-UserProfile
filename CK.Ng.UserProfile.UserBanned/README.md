# CK.Ng.UserProfile.UserBanned

Angular CKomposable package that brings the banishment flow to the client: as soon as a user is
banished it is logged out and sent back to the authentication page, where the login is already refused
by `CK.sAuthUserOnLogin`.

Four pieces: a `CanActivateFn`, the `BannedSession` service that owns the single logout path, an
`AppRoutes.t` that hooks the guard onto the private page, and the translations. The `isBanned` flag
they read comes with the referenced `CK.IO.User.UserBanned`.

## What it brings.

| | |
|---|---|
| Guard | [`banned-guard.ts`](Res/banned-guard.ts) - `bannedGuard`, registered on the private page |
| Service | [`banned-session.ts`](Res/banned-session.ts) - `BannedSession`, owns the single logout path |
| Transformer | [`AppRoutes.t`](Res/AppRoutes.t) |
| Translations | `CK.Auth.Banned.Message`, in [default.jsonc](Res/ts-locales/default.jsonc) and [fr.jsonc](Res/ts-locales/fr.jsonc) |

## Requires.

- `CK.Ng.UserProfile` and `CK.IO.User.UserBanned` - which brings `IUserProfile.IsBanned` and
  `ISetUserBannedCommand`.

## The detection.

The navigation guard reads `isBanned` on the loaded profile: a navigation, a hard reload or a typed URL
of a banished user logs it out through `BannedSession` (idempotent: concurrent navigations act once).

**This is not a security mechanism.** What actually makes a banishment effective is the server refusing
the commands of a banished actor and the refresh of its session: the client then becomes anonymous.
The guard only stops the client from displaying an application it can no longer use.

## What the application still supplies.

One thing, and it is not the flag. `IsBanned` comes with
[`CK.IO.User.UserBanned`](https://github.com/signature-opensource/CK-DB-User-UserBanned/blob/stable/CK.IO.User.UserBanned/IUserProfile.cs),
which this package references:

```csharp
public interface IUserProfile : Actor.IUserProfile
{
    public bool IsBanned { get; set; }
}
```

Deliberately a single boolean, and the reason is stated where it is declared: the profile answers *"may
this user use the application"*, not why or until when. The reason and the end date belong to the
administration screens.

What the application owns is the **Poco leaf** that materializes the family, plus the query that fills
it. From this repository's own sample:

```csharp
public interface IUserProfile : IO.User.PreferredCulture.IUserProfile,
                               IO.UserProfile.Workspace.IUserProfile,
                               IO.User.UserPassword.Reset.IUserProfile,
                               IO.User.UserBanned.IUserProfile
{
}
```

Its summary says why: *"It multiply-inherits the feature-package extensions so that a single
materialization carries them all"* - the Poco engine merges the whole family into the one concrete
`CK.IO.Actor.IUserProfile` implementation. Reference the packages and declare the leaf; the query then
computes `IsBanned` from the ban rows, which the sample does with an `exists(...)` over the
currently-banned view.

See [`IUserProfile`](../Sample/CK.Ng.UserProfile.Sample.App/IUserProfile.cs) and
[`UserQueries`](../Sample/CK.Ng.UserProfile.Sample.App/UserQueries.cs).

## Why AppRoutes.t is additive.

The guard is registered by appending into the `canActivate` array of the private page - one line:

```
insert "bannedGuard, " after single "canActivate: [";
```

The array, and the `runGuardsAndResolvers: 'always'` that makes an appended guard re-run, are emitted
upstream by [`CK.Ng.UserProfile`](../CK.Ng.UserProfile/README.md); see its
[`Res/AppRoutes.t`](../CK.Ng.UserProfile/Res/AppRoutes.t) for why they are owned there rather than by
each guard.

What that buys is the thing worth stating: this package does **not** depend on any other package that
appends to the same array, nor on the order the transformers run in. Appending never creates a second
`canActivate`, so `single` keeps matching the one the base package emitted, whatever number of
satellites append beside it.

