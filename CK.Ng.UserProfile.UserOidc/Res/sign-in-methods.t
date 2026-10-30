create <html> transformer
begin
    inject """

           <!-- <PreUserProfileOidcSection revert /> -->
           <ck-oidc-identities />
           <!-- <PostUserProfileOidcSection /> -->

           """ into <PostSignInMethodsSections>;
end

create <ts> transformer
begin
    ensure import { OidcIdentities } from '@local/ck-gen';

    insert "OidcIdentities, " after single "imports: [";
end
