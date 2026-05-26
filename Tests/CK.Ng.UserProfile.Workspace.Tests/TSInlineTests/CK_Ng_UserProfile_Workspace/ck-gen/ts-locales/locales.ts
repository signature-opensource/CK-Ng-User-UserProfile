import { inject, Injectable, LOCALE_ID, Provider, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzI18nInterface, NzI18nService, en_US } from 'ng-zorro-antd/i18n';


export async function loadTranslations( lang: string ): Promise<{ [key: string]: string }> {
  switch( lang ) {
    default: return ( await import( './en.json' ) ).default;
  }
}

export type LocaleInfo = {
  name: string;
  nativeName: string;
  englishName: string;
  id: number;
  ngxTranslate: string;
  zorro: NzI18nInterface;
};

export type CKLocales = {
  [localeCode: string]: LocaleInfo;
};

export const locales: CKLocales = {
  "en": { name: 'en', "nativeName": 'English', "englishName": 'English', "id": 221272233, "ngxTranslate": 'en', "zorro": en_US },
}

export const DEFAULT_LOCALE_INFO = locales['en'];
@Injectable( { providedIn: 'root' } )
export class LocaleService {
  readonly #translate = inject( TranslateService );
  readonly #zorro = inject( NzI18nService );

  currentLocale = signal<string>( 'en' );

  constructor() {
    const supported = Object.keys( locales );
    this.#translate.addLangs( supported );
    this.#translate.setFallbackLang( 'en' );
    this.setLocale( 'en' );
  }

  async setLocale( locale: string ): Promise<void> {
    const config = locales[locale];
    if ( !config ) throw new Error( `Unsupported locale: ${locale}` );
    
    this.currentLocale.set( locale );
    this.#translate.use( config.ngxTranslate );
    this.#zorro.setLocale( config.zorro );
  }
}

export class LocaleId extends String {
  readonly #localeService = inject( LocaleService );
  constructor() {
    super();
  }

  override toString(): string {
    return this.#localeService.currentLocale();
  }

  override valueOf(): string {
    return this.toString();
  }
}

export const LocaleProvider: Provider = {
  provide: LOCALE_ID,
  useClass: LocaleId,
  deps: [LocaleService],
};