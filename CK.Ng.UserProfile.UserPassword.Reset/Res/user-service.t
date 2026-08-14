create <ts> transformer
begin
    ensure import { Router } from '@angular/router';

    inject """
           readonly #router = inject( Router );

           """ into <PreDependencyInjection>;

    inject """

            // Navigation guard of the temporary password flow. refreshUserProfileAsync is replayed
            // on every authentication change and after every profile mutation, so this covers both
            // the initial login and any later refresh. The reset form calls it back once the new
            // password is set, which clears the flag and releases the redirection.
            if ( res?.isTemporaryPassword ) {
                this.#router.navigate( ['/reset-password'] );
            }

           """ into <PostUserProfileRefresh>;
end
