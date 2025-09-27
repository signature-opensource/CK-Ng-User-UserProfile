create <html> transformer
begin
    inject """

           <!-- <PreUserProfileSecurityTab revert /> -->
           <nz-tab [nzTitle]="'CK.UserProfile.Security' | translate">
                <ng-template nz-tab>
                    <!-- <PreUserProfilePasswordForm revert /> -->
                    <ck-user-password-form />
                    <!-- <PostUserProfilePasswordForm /> -->
                </ng-template>
            </nz-tab>
            <!-- <PostUserProfileSecurityTab /> -->

           """ into <PostUserProfileGeneralInfosTab>;
end

create <ts> transformer
begin
    ensure import { UserPasswordForm } from '@local/ck-gen';

    in after "@Component" 
            in first {^braces}
                in after "imports:"
                    in first {^[]}
                        replace "UserUpdateForm" with """
                                                               UserUpdateForm,
                                                                       UserPasswordForm

                                                               """;
end
