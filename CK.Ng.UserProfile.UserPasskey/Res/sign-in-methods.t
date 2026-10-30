create <html> transformer
begin
    inject """

           <!-- <PreUserProfilePasskeySection revert /> -->
           <ck-passkey-list />
           <!-- <PostUserProfilePasskeySection /> -->

           """ into <PostSignInMethodsSections>;
end

create <ts> transformer
begin
    ensure import { PasskeyList } from '@local/ck-gen';

    insert "PasskeyList, " after single "imports: [";
end
