namespace CK.Ng.UserProfile.Sample.App;

/// <summary>
/// App-level leaf of the user-profile Poco family. It multiply-inherits the feature-package
/// extensions so that a single materialization carries them all: the preferred culture, the
/// preferred workspace + groups, the temporary-password state and the banishment state.
/// <para>
/// Same pattern as <see cref="WorkspaceUsers.ICombinedWorkspaceUser"/>: the Poco engine merges the
/// whole family into the one concrete <c>CK.IO.Actor.IUserProfile</c> implementation.
/// </para>
/// </summary>
public interface IUserProfile : IO.User.PreferredCulture.IUserProfile,
                               IO.UserProfile.Workspace.IUserProfile,
                               IO.User.UserPassword.Reset.IUserProfile,
                               IO.User.UserBanned.IUserProfile
{
}
