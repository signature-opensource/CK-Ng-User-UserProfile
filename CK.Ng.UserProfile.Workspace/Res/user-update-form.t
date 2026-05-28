create <ts> transformer
begin
    ensure import { SetPreferredWorkspaceIdCommand } from '@local/ck-gen';

    inject """

           // <PrePreferredWorkspaceFormControlDefinition revert />
           const preferredWorkspaceId = new FormControlConfig(
               'select',
               this.#translateService.instant( 'CK.UserProfile.PreferredWorkspace' ),
               this.userProfile()!.preferredWorkspaceId,
               {
                   options: this.userProfile()!.groups
                       .filter( g => g.group.isZone )
                       .map( g => ({ label: g.group.groupName, value: g.group.groupId }) ),
                   show: () => this.userProfile()!.groups.some( g => g.group.isZone )
               }
           );
           // <PostPreferredWorkspaceFormControlDefinition />

           """ into <PreUserPreferencesFormControlDefinition>;

    inject """

           preferredWorkspaceId,

           """ into <PreUserPreferencesFormControlRegistration>;

    inject """

           // <PreSetPreferredWorkspaceIdCommandRegistering />
           if( form.get( 'preferredWorkspaceId' )!.value !== this.userProfile()!.preferredWorkspaceId ) {
               const setWorkspaceCmd = new SetPreferredWorkspaceIdCommand();

               setWorkspaceCmd.userId = this.userProfile()!.userId;
               setWorkspaceCmd.workspaceId = form.get( 'preferredWorkspaceId' )!.value;
               batchCmd.commands.push( { command: setWorkspaceCmd, description: 'Setting user\'s preferred workspace.' } );
           }
           // <PostSetPreferredWorkspaceIdCommandRegistering />
           """ into <PostSetUserNameCommandRegistering>;

    inject """
           // <PrePreferredWorkspaceReset revert />
           preferredWorkspaceId: this.userProfile()!.preferredWorkspaceId,
           // <PostPreferredWorkspaceReset />
           """ into <PostUserNameReset>;
end
