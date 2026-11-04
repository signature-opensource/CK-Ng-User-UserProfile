import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, UserService, BasicLoginCommand } from '@local/ck-gen';
import { locales, LocaleService } from '@local/ck-gen/ts-locales/locales';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzI18nService } from 'ng-zorro-antd/i18n';
import { AppComponent } from './app.component';
import { firstValueFrom } from 'rxjs';

function basicLogin( userName: string, password: string ): BasicLoginCommand {
    const c = new BasicLoginCommand();
    c.userName = userName;
    c.password = password;
    return c;
}

// The preferred culture of the user is the locale of the application: after the refresh of the profile, every holder
// of the culture follows it (the default locale is 'en', TestUser prefers 'fr').
describe( 'The preferred culture', () => {
    let ngAuthService: NgAuthService;
    let cris: HttpCrisEndpoint;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                imports: [AppComponent],
                providers: [...CKGenAppModule.Providers, { provide: ComponentFixtureAutoDetect, useValue: true }]
            } ).compileComponents();

        ngAuthService = TestBed.inject( NgAuthService );
        cris = TestBed.inject( HttpCrisEndpoint );
        await ngAuthService.authService.isInitialized;
        await cris.updateAmbientValuesAsync();
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
        ngAuthService.authService.close();
    } );

    it( 'sets the LocaleService, ngx-translate, ng-zorro, LOCALE_ID and the commands', async () => {
        const localeService = TestBed.inject( LocaleService );
        await localeService.setLocale( 'en' );

        await cris.sendOrThrowAsync( basicLogin( 'TestUser', 'success' ) );
        expect( ngAuthService.level() ).toBeGreaterThanOrEqual( AuthLevel.Normal );
        const userService = TestBed.inject( UserService );
        await userService.refreshUserProfileAsync();
        expect( userService.userProfile()!.extendedCultureId ).toBe( locales['fr'].id );

        // ngx-translate switches its current language once the translations of the language are loaded, and
        // LocaleService.setLocale doesn't wait for it: on a loaded machine, they may not be loaded yet.
        const translate = TestBed.inject( TranslateService );
        if( translate.getCurrentLang() !== 'fr' ) await firstValueFrom( translate.onLangChange );

        // One comparison: a failure shows every holder of the culture.
        expect( {
            locale: localeService.currentLocale(),
            translate: translate.getCurrentLang(),
            zorro: TestBed.inject( NzI18nService ).getLocale().locale,
            localeId: TestBed.inject( LOCALE_ID ).toString(),
            commands: cris.ambientValuesOverride.currentCultureName
        } ).toEqual( { locale: 'fr', translate: 'fr', zorro: locales['fr'].zorro.locale, localeId: 'fr', commands: 'fr' } );
    } );
} );
