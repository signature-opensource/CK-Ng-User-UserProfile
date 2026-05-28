create <html> transformer
begin
    inject """

           <!-- <PreUserProfilePreferredWorkspaceProp revert /> -->
           <div class="profile-prop preferred-workspace">
                <span class="prop-name">{{ 'CK.UserProfile.PreferredWorkspace' | translate }}</span>
                <span class="prop-value">{{ getGroupDisplayName( profile.preferredWorkspaceId ) }}</span>
            </div>
           <!-- <PostUserProfilePreferredWorkspaceProp /> -->

           """ into <PostProfilePropsRegistration>;
end

create <ts> transformer
begin
    inject """

             getGroupDisplayName( groupId: number ): string {
               return this.userProfile()?.groups.find( g => g.group.groupId === groupId )?.group.groupName ?? '';
             }

           """ into <PostLocalVariables>;
end
