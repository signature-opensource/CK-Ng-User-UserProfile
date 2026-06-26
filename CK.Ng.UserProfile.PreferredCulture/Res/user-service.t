create <ts> transformer
begin
    ensure import { TranslateService } from '@ngx-translate/core';
    ensure import { locales, DEFAULT_LOCALE_INFO } from '@local/ck-gen/ts-locales/locales';

    inject """
           readonly #translateService = inject( TranslateService );

           """ into <PreDependencyInjection>;

    inject """
           
            const prefCulture = Object.values( locales ).find( l => l.id === res?.extendedCultureId )?.ngxTranslate ?? DEFAULT_LOCALE_INFO.ngxTranslate;
            this.#cris.ambientValuesOverride.currentCultureName = prefCulture;
            if ( this.#translateService.getCurrentLang() !== prefCulture ) {
                this.#translateService.use( prefCulture );
            }

           """ into <PostUserProfileRefresh>;
end
