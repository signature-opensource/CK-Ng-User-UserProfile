# CK.UserProfile

Server side of the user profile: [`UpdateUserCommandHandler`](UpdateUserCommandHandler.cs) handles the
`IUpdateUserCommand` of [CK.IO.UserProfile](../CK.IO.UserProfile/README.md). It runs where the database
is: in the authentication center of a distributed application, the front only has the profile page
([CK.Ng.UserProfile](../CK.Ng.UserProfile/README.md)) and its commands reach this handler by location
transparency.

The batched commands are executed in order, in the same command context and in one transaction (on the
database of `CK.DB.Actor`'s `UserTable`): the first failure throws and the transaction is rolled back.
Each executed command's result is in the `IUpdateUserCommandResult`.

The handler is a real object, found when this assembly is in the application: an application that
references this project but uses none of its types keeps the reference with
`[assembly: CK.Setup.PreserveAssemblyReference( typeof( UpdateUserCommandHandler ) )]`.

## Requires.

- `CK.IO.UserProfile` (the command), `CK.DB.Actor`, `CK.SqlServer.Transaction`, `CK.Cris.Executor`.
