create <ts> transformer
begin
    ensure import { SetPreferredWorkspaceIdCommand, selectField } from '@local/ck-gen';

    inject """

           // <PrePreferredWorkspaceFormControlDefinition revert />
           const preferredWorkspaceId = selectField( 'CK.UserProfile.PreferredWorkspace', this.userProfile()?.preferredWorkspaceId ?? 0, {
               options: ( this.userProfile()?.groups ?? [] )
                   .filter( g => g.group.isZone )
                   .map( g => ({ label: g.group.groupName, value: g.group.groupId }) ),
               show: () => ( this.userProfile()?.groups ?? [] ).some( g => g.group.isZone )
           } );
           // <PostPreferredWorkspaceFormControlDefinition />

           """ into <PreUserPreferencesFormControlDefinition>;

    inject """

           preferredWorkspaceId,

           """ into <PreUserPreferencesFormControlRegistration>;

    inject """

           // <PreSetPreferredWorkspaceIdCommandRegistering />
           if( value.preferredWorkspaceId !== this.userProfile()!.preferredWorkspaceId ) {
               const setWorkspaceCmd = new SetPreferredWorkspaceIdCommand();

               setWorkspaceCmd.userId = this.userProfile()!.userId;
               setWorkspaceCmd.workspaceId = value.preferredWorkspaceId;
               batchCmd.commands.push( { command: setWorkspaceCmd, description: 'Setting user\'s preferred workspace.' } );
           }
           // <PostSetPreferredWorkspaceIdCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;
end
