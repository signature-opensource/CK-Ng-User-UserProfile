create <html> transformer
begin
    inject """

           <!-- <PreUserProfileFirstNameProp revert /> -->
           <div class="profile-prop">
                <span class="prop-name">{{ 'CK.UserProfile.FirstName' | translate }}</span>
                <span class="prop-value">{{ userProfile()!.firstName }}</span>
            </div>
           <!-- <PostUserProfileFirstNameProp /> -->

           <!-- <PreUserProfileLastNameProp revert /> -->
           <div class="profile-prop">
                <span class="prop-name">{{ 'CK.UserProfile.LastName' | translate }}</span>
                <span class="prop-value">{{ userProfile()!.lastName }}</span>
            </div>
           <!-- <PostUserProfileLastNameProp /> -->

           """ into <PreProfilePropsRegistration>;
end

create <ts> transformer
begin
    inject """

           const firstName = this.#userService.userProfile()?.firstName;
           const lastName = this.#userService.userProfile()?.lastName
           if ( firstName && lastName ) {
               return `${trimAndUpper( firstName.trim().slice( 0, 1 ) )}${trimAndUpper( lastName.trim().slice( 0, 1 ) )}`;
           }

           """ into <PreAvatarFallbackComputing>
end
