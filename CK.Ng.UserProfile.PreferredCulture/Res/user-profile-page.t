create <html> transformer
begin
    inject """

           <!-- <PreUserProfilePreferredCultureProp revert /> -->
           <div class="profile-prop preferred-culture">
                <span class="prop-name">{{ 'CK.UserProfile.PreferredCultureName' | translate }}</span>
                <span class="prop-value">{{ getPreferredCultureDisplayedName() }}</span>
            </div>
           <!-- <PostUserProfilePreferredCultureProp /> -->

           """ into <PostProfilePropsRegistration>;
end

create <ts> transformer
begin
    ensure import { locales } from '@local/ck-gen/ts-locales/locales';

    inject """

             getPreferredCultureDisplayedName(): string {
               return locales[this.userProfile()!.preferredCultureName].nativeName;
             }

           """ into <PostLocalVariables>;
end
