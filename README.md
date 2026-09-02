# CK-Ng-User-UserProfile

The Angular user profile: the `/profile` page, and everything a user can change about itself.

The base package owns the page and its update form as anchored files; every other package adds a
property, a form control and a command by transforming them. Reference only what the application
needs - the base package does not know its satellites.

| Package | Description |
|---------|-------------|
| [CK.Ng.UserProfile](CK.Ng.UserProfile/README.md) | The `/profile` page, the user update form, the user service and the batch update command. |
| [CK.Ng.UserProfile.NamedUser](CK.Ng.UserProfile.NamedUser/README.md) | First name and last name, and the avatar initials. |
| [CK.Ng.UserProfile.PreferredCulture](CK.Ng.UserProfile.PreferredCulture/README.md) | Preferred language - and makes the UI follow it. |
| [CK.Ng.UserProfile.Workspace](CK.Ng.UserProfile.Workspace/README.md) | Preferred workspace. |
| [CK.Ng.UserProfile.UserPassword](CK.Ng.UserProfile.UserPassword/README.md) | The Security tab: change password, strength display and validators. |
| [CK.Ng.UserProfile.UserPassword.Reset](CK.Ng.UserProfile.UserPassword.Reset/README.md) | Temporary password flow, for an authenticated user. No e-mail. |
| [CK.Ng.UserProfile.UserPassword.Lost](CK.Ng.UserProfile.UserPassword.Lost/README.md) | Lost password flow, anonymous, with e-mail. |
| [CK.Ng.UserProfile.UserBanned](CK.Ng.UserProfile.UserBanned/README.md) | The client side of a banishment: the banished user is ejected from the application. |

`Sample/` builds a runnable application over these packages, and each `Tests/*.Tests` project carries
a generated Angular workspace under `TSInlineTests/`.
