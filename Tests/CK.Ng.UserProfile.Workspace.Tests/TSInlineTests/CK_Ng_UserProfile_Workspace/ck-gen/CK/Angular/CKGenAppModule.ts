import { NgModule, Provider, EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import axios from 'axios';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { DEFAULT_LOCALE_INFO } from '@local/ck-gen/ts-locales/locales';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNgAuthSupport } from '@local/ck-gen/CK/Ng/AspNet/Auth/auth-service-support';
import { AXIOS } from '@local/ck-gen/CK/Ng/AXIOSToken';
import { CKTranslationsLoader } from '@local/ck-gen/CK/Ng/Localization/TranslationsLoader';
import { AUTH_SERVICE_CONFIGURATION } from '@local/ck-gen/CK/Ng/AspNet/Auth/AUTH_SERVICE_CONFIGURATIONToken';
import { AuthService } from '@local/ck-gen/CK/AspNet/Auth/AuthService';
import { HttpCrisEndpoint } from '@local/ck-gen/CK/Cris/HttpCrisEndpoint';
import { provideNgCrisAspNetAuthSupport } from '@local/ck-gen/CK/Ng/Cris/AspNet/Auth/cris-aspnet-auth-providers';
import { UserService } from '@local/ck-gen/CK/Ng/UserProfile/user-service';

import { LocaleProvider } from '@local/ck-gen/ts-locales/locales';

export type SourcedProvider = (EnvironmentProviders | Provider) & {source: string};

/**
 * Array-like of Provider or EnvironmentProviders that supports {@link exclude}
 * to remove some of them: they can be manually reinjected if nominal configuration
 * must be changed.
 */
export class SourcedProviders extends Array<SourcedProvider> {
    /**
     * Excludes all the providers issued by the given source.
     * At least one such provider must exist otherwise this throws.
     */
    exclude( sourceName: string ): SourcedProviders
    {
        let idx = this.findIndex( s => s.source === sourceName );
        if( idx < 0 ) throw new Error( `No provider from source '${sourceName}' found.` );
        do
        {
            this.splice( idx, 1 );
        }
        while( (idx = this.findIndex( s => s.source === sourceName )) >= 0 );
        return this;
    }
    
    static createFrom(o: SourcedProvider[]) {
        const sp = new SourcedProviders();
        sp.push(...o);
        return sp;
    }
}

@NgModule({
    imports: [

    ],
    exports: [

    ] })
export class CKGenAppModule {
    private static s( p: EnvironmentProviders | Provider, source: string ) : SourcedProvider
    {
        const s = <SourcedProvider>p;
        s.source = source; 
        return s;
    }

    static Providers : SourcedProviders = SourcedProviders.createFrom( [
      CKGenAppModule.s( LocaleProvider, "CK.TS.Angular" ),
CKGenAppModule.s( { provide: AXIOS, useValue: axios.create() }, "CK.Ng.Axios.AxiosPackage" ),
CKGenAppModule.s( provideTranslateService( { fallbackLang: DEFAULT_LOCALE_INFO.ngxTranslate, lang: DEFAULT_LOCALE_INFO.ngxTranslate, loader: { provide: TranslateLoader, useClass: CKTranslationsLoader } }), "CK.Ng.Localization.LocalizationPackage" ),
CKGenAppModule.s( provideNzI18n( DEFAULT_LOCALE_INFO.zorro ), "CK.Ng.Zorro.ZorroPackage" ),
CKGenAppModule.s( { provide: AuthService, useFactory: () => new AuthService( inject( AXIOS ), (inject( AUTH_SERVICE_CONFIGURATION, { optional: true } ) ?? undefined) ) }, "CK.Ng.AspNet.Auth.AspNetAuthPackage" ),
CKGenAppModule.s( provideNgAuthSupport(), "CK.Ng.AspNet.Auth.AspNetAuthPackage#Support" ),
CKGenAppModule.s( { provide: HttpCrisEndpoint, useFactory: () => new HttpCrisEndpoint( inject( AXIOS ) ) }, "CK.Ng.Cris.AspNet.CrisAspNetPackage" ),
CKGenAppModule.s( provideNgCrisAspNetAuthSupport(), "CK.Ng.Cris.AspNet.Auth.CrisAspNetAuthPackage#Support" ),
CKGenAppModule.s( provideAppInitializer( () => { inject( UserService ); } ), "CK.Ng.UserProfile.UserProfilePackage" ),

    ] );
}