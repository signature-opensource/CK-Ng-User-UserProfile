create <ts> transformer
begin
    ensure import { TranslateService } from '@ngx-translate/core';

    inject """
           readonly #translateService = inject( TranslateService );

           """ into <PreDependencyInjection>;

    inject """
           
            const prefCulture = res?.preferredCultureName ?? 'en';
            this.#cris.ambientValuesOverride.currentCultureName = prefCulture;
            if ( this.#translateService.currentLang !== prefCulture ) {
                this.#translateService.use( prefCulture );
            }

           """ into <PostUserProfileRefresh>;
end
