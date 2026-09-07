# CK-Ng-User-UserProfile

[![Licence](https://img.shields.io/github/license/signature-opensource/CK-Ng-User-UserProfile.svg)](LICENSE)

The Angular user profile: the `/profile` page, and everything a user can change about itself.

The base package owns the page and its update form as anchored files; every other package adds a
property, a form control and a command by transforming them. Reference only what the application
needs - the base package does not know its satellites.

| Package | Description | Latest stable |
|---------|-------------|---------------|
| [CK.Ng.UserProfile](CK.Ng.UserProfile/README.md) | The `/profile` page, the user update form, the user service and the batch update command. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.svg?label=CK.Ng.UserProfile)](https://www.nuget.org/packages/CK.Ng.UserProfile/) |
| [CK.Ng.UserProfile.NamedUser](CK.Ng.UserProfile.NamedUser/README.md) | First name and last name, and the avatar initials. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.NamedUser.svg?label=CK.Ng.UserProfile.NamedUser)](https://www.nuget.org/packages/CK.Ng.UserProfile.NamedUser/) |
| [CK.Ng.UserProfile.PreferredCulture](CK.Ng.UserProfile.PreferredCulture/README.md) | Preferred language - and makes the UI follow it. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.PreferredCulture.svg?label=CK.Ng.UserProfile.PreferredCulture)](https://www.nuget.org/packages/CK.Ng.UserProfile.PreferredCulture/) |
| [CK.Ng.UserProfile.Workspace](CK.Ng.UserProfile.Workspace/README.md) | Preferred workspace. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.Workspace.svg?label=CK.Ng.UserProfile.Workspace)](https://www.nuget.org/packages/CK.Ng.UserProfile.Workspace/) |
| [CK.Ng.UserProfile.UserPassword](CK.Ng.UserProfile.UserPassword/README.md) | The Security tab: change password, strength display and validators. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.UserPassword.svg?label=CK.Ng.UserProfile.UserPassword)](https://www.nuget.org/packages/CK.Ng.UserProfile.UserPassword/) |
| [CK.Ng.UserProfile.UserPassword.Reset](CK.Ng.UserProfile.UserPassword.Reset/README.md) | Temporary password flow, for an authenticated user. No e-mail. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.UserPassword.Reset.svg?label=CK.Ng.UserProfile.UserPassword.Reset)](https://www.nuget.org/packages/CK.Ng.UserProfile.UserPassword.Reset/) |
| [CK.Ng.UserProfile.UserPassword.Lost](CK.Ng.UserProfile.UserPassword.Lost/README.md) | Lost password flow, anonymous, with e-mail. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.UserPassword.Lost.svg?label=CK.Ng.UserProfile.UserPassword.Lost)](https://www.nuget.org/packages/CK.Ng.UserProfile.UserPassword.Lost/) |
| [CK.Ng.UserProfile.UserBanned](CK.Ng.UserProfile.UserBanned/README.md) | The client side of a banishment: the banished user is ejected from the application. | [![nuget](https://img.shields.io/nuget/v/CK.Ng.UserProfile.UserBanned.svg?label=CK.Ng.UserProfile.UserBanned)](https://www.nuget.org/packages/CK.Ng.UserProfile.UserBanned/) |

`Sample/` builds a runnable application over these packages, and each `Tests/*.Tests` project carries
a generated Angular workspace under `TSInlineTests/`.
