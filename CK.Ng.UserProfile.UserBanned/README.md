# CK.Ng.UserProfile.UserBanned

Angular CKomposable package that brings the banishment flow to the client: as soon as a user is
banished it is logged out and sent back to the authentication page, where the login is already refused
by `CK.sAuthUserOnLogin`.

Four pieces: a `CanActivateFn`, the `BannedSession` service that owns the single logout path, an
`AppRoutes.t` that hooks the guard onto the private page, and the translations. The `isBanned` flag they
all read is not one of them - it is supplied by the application's user profile, and only read here.

## What it brings.

| | |
|---|---|
| Guard | [`banned-guard.ts`](Res/banned-guard.ts) - `bannedGuard`, registered on the private page |
| Service | [`banned-session.ts`](Res/banned-session.ts) - `BannedSession`, holds the session channel and owns the single logout path |
| Transformer | [`AppRoutes.t`](Res/AppRoutes.t) |
| Translations | `CK.Auth.Banned.Message`, in [default.jsonc](Res/ts-locales/default.jsonc) and [fr.jsonc](Res/ts-locales/fr.jsonc) |

`BannedSession` is forced at startup through `provideAppInitializer`: the channel must be listening
before the user does anything, and nothing else would inject the service until a navigation happens.

## Requires.

- `CK.Ng.UserProfile`, `CK.AspNet.ActorChannel`, `CK.Ng.AspNet.WebSocketChannel`

## Three detections, one exit.

Three independent paths lead to the logout, by decreasing speed:

1. **The push on the session channel** - the user is ejected the instant an administrator confirms the
   ban.
2. **The rejection of the channel registration** - the case of a user that was unreachable and comes
   back.
3. **The navigation guard** - a hard reload, or a typed URL.

All three converge on the single logout path owned by `BannedSession`, which is why the service exists
at all rather than the logic living in the guard.

**None of them is a security mechanism.** What actually makes a banishment effective is the server
refusing the commands of a banished actor. These three paths only stop the client from displaying an
application it can no longer use.

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

