# CK.Ng.UserProfile.UserBanned

Angular CKomposable package that brings the banishment flow to the client: as soon as a user is
banished it is logged out and sent back to the authentication page, where the login is already refused
by `CK.sAuthUserOnLogin`.

Five pieces: a `CanActivateFn`, the `BannedSession` service that owns the single logout path, an
`AppRoutes.t` that hooks the guard onto the private page, the translations, and `UserBannedPushService`
- the `[CommandPostHandler]` that pushes the ban to the user's sessions. The `isBanned` flag they read
comes with the referenced `CK.IO.User.UserBanned`.

## What it brings.

| | |
|---|---|
| Guard | [`banned-guard.ts`](Res/banned-guard.ts) - `bannedGuard`, registered on the private page |
| Service | [`banned-session.ts`](Res/banned-session.ts) - `BannedSession`, holds the actor channel and owns the single logout path |
| Transformer | [`AppRoutes.t`](Res/AppRoutes.t) |
| Translations | `CK.Auth.Banned.Message`, in [default.jsonc](Res/ts-locales/default.jsonc) and [fr.jsonc](Res/ts-locales/fr.jsonc) |
| Server side | [`UserBannedPushService.cs`](UserBannedPushService.cs) - the `[CommandPostHandler]` that pushes the ban on the actor channel |

`BannedSession` is forced at startup through `provideAppInitializer`: the channel must be listening
before the user does anything, and nothing else would inject the service until a navigation happens.

## Requires.

- `CK.Ng.UserProfile`, `CK.IO.User.UserBanned` - which brings `IUserProfile.IsBanned` and
  `ISetUserBannedCommand` - and `CK.Ng.AspNet.ActorChannel`.

## Three detections, one exit.

Three independent paths lead to the logout, by decreasing speed:

1. **The push on the actor channel** - the user is ejected the instant an administrator confirms the
   ban.
2. **The rejection of the channel registration** - the case of a user that was unreachable and comes
   back.
3. **The navigation guard** - a hard reload, or a typed URL.

All three converge on the single logout path owned by `BannedSession`, which is why the service exists
at all rather than the logic living in the guard.

**None of them is a security mechanism.** What actually makes a banishment effective is the server
refusing the commands of a banished actor. These three paths only stop the client from displaying an
application it can no longer use.

## The push, and the three decisions it makes.

[`UserBannedPushService`](UserBannedPushService.cs) is the server half, and its own summary calls it
*"the only place where the banishment feature and the actor channel meet"*:

```csharp
public const string BannedMessageType = "banned";

[CommandPostHandler]
public Task OnUserBannedAsync( ISetUserBannedCommand cmd, ICrisBasicCommandResult result )
{
    // ... a constructor taking IActorChannelPush elided
    if( !result.Success ) return Task.CompletedTask;
    if( cmd.BanStartDate.HasValue && cmd.BanStartDate.Value > DateTime.UtcNow ) return Task.CompletedTask;
    return _push.PushAsync( cmd.UserId, BannedMessageType );
}
```

Each of the three is a bug if you skip it, and the source says so for all three:

- **`[CommandPostHandler]`, not a handler override.** It is purely additive, so the handler brought by
  the database side stays untouched - and being declared on `ISetUserBannedCommand` it also catches the
  workspace-scoped specialization an administration screen actually sends.
- **`result.Success` is the only proof.** The ban handler reports its failures through the result rather
  than by throwing, so a post handler that ran on the absence of an exception would eject users whose
  ban was refused.
- **A future `BanStartDate` must not eject anybody**, because a ban can be scheduled.

⚠️ **`"banned"` is declared twice inside this package, and nothing checks that the two agree.** The
`BannedMessageType` above and the `BANNED_MESSAGE_TYPE = 'banned'` of
[`banned-session.ts`](Res/banned-session.ts) are two independent string literals; the C# comment asks
the reader to keep them in sync, which is the only thing holding them together. Change one and the
instant ejection stops working silently - the other two detections still fire, so the symptom is a
delay rather than a failure.

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

