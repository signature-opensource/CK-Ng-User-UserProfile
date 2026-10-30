# CK.IO.UserProfile

The commands of the user profile, shared by the profile page
([CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md)) and their handler
([CK.UserProfile](../CK.UserProfile/README.md)), that run in different processes of a distributed
application.

| Type | Role |
|---|---|
| [`IUpdateUserCommand`](IUpdateUserCommand.cs) | The batch of the profile's update form (`ICommandSimpleBatch`, `ICommandCurrentCulture`, `ICommandAuthNormal`): each satellite of the form pushes its own command into `Commands`. Its result is an `IUpdateUserCommandResult`. |
| [`ICommandSimpleBatch`](ICommandSimpleBatch.cs) | The simple batch part: `Commands` (the batched commands and their description), `ISimpleBatchCommandResultPart` (their results), `IPocoCommandExecutedCommandResult`. |

The simple batch types are declared in the `CK.Cris` namespace and `IUpdateUserCommand` in `CK.IO.Actor`, not in
this package's namespace: the simple batch is expected to move to CK-Cris. `ITestBatchCommand` and `ITestCommand`
next to them are scaffolding, not API.
