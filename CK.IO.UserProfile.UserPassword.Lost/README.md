# CK.IO.UserProfile.UserPassword.Lost

The commands of the lost password flow, shared by the pages
([CK.Ng.UserProfile.UserPassword.Lost](../CK.Ng.UserProfile.UserPassword.Lost/README.md)) and their
handler ([CK.UserProfile.UserPassword.Lost](../CK.UserProfile.UserPassword.Lost/README.md)), that run in
different processes of a distributed application.

| Command | Role |
|---|---|
| [`ISendForgotPasswordEmailCommand`](ISendForgotPasswordEmailCommand.cs) | Sends the "password lost" e-mail with a recovery token for an `Email`. Its result never discloses whether the address is known. |
| [`IRecoverPasswordCommand`](IRecoverPasswordCommand.cs) | Sets a new `Password` for the user identified by the `Token` of the e-mail. |

Both are **anonymous by design** (the token is the only proof of identity), `ICommandCurrentCulture`, and
answer an `ICrisBasicCommandResult`.
