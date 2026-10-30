create <html> transformer
begin
    inject """

           <!-- <PreUserProfilePasswordSection revert /> -->
           <ck-password-section />
           <!-- <PostUserProfilePasswordSection /> -->

           """ into <PostSignInMethodsSections>;
end

create <ts> transformer
begin
    ensure import { PasswordSection } from '@local/ck-gen';

    insert "PasswordSection, " after single "imports: [";
end
