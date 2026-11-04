create <ts> transformer
begin
    ensure import { LocaleService, locales, DEFAULT_LOCALE_INFO } from '@local/ck-gen/ts-locales/locales';

    inject """
           readonly #localeService = inject( LocaleService );

           """ into <PreDependencyInjection>;

    inject """

            // The preferred culture is the locale of the application: LocaleService.setLocale sets ngx-translate, ng-zorro
            // and LOCALE_ID. The commands follow at once (CK.Ng.Cris.AspNet also makes them follow the LocaleService).
            const prefLocale = Object.values( locales ).find( l => l.id === res?.extendedCultureId ) ?? DEFAULT_LOCALE_INFO;
            this.#cris.ambientValuesOverride.currentCultureName = prefLocale.name;
            if ( this.#localeService.currentLocale() !== prefLocale.name ) {
                await this.#localeService.setLocale( prefLocale.name );
            }

           """ into <PostUserProfileRefresh>;
end
