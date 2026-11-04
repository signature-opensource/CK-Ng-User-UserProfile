import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    CrisBasicCommandResult,
    HttpCrisEndpoint,
    NotificationService,
    RecoverPasswordCommand,
    RecoverPasswordForm
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';
import { appConfig } from './app.config';

describe( 'ck-recover-password-form', () => {
    const STRONG = 'Abcdefg1!';

    let fixture: ComponentFixture<RecoverPasswordForm>;
    let send: jest.Mock;
    let navigate: jest.SpyInstance;
    let translate: TranslateService;

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const item = ( index: number ) => host().querySelectorAll( 'nz-form-item' )[index];
    const passwordInput = () => item( 0 ).querySelector( 'input' ) as HTMLInputElement;
    const confirmInput = () => item( 1 ).querySelector( 'input' ) as HTMLInputElement;
    const tipOf = ( index: number ) => item( index ).querySelector( '.ant-form-item-explain-error' )?.textContent?.trim() ?? '';
    const submitButton = () => host().querySelector( '.ck-recover-password-form-submit' ) as HTMLButtonElement;
    const type = async ( input: HTMLInputElement, text: string ) => {
        input.value = text;
        input.dispatchEvent( new Event( 'input' ) );
        input.dispatchEvent( new Event( 'blur' ) );
        await render();
    };
    const fill = async ( password: string, confirm: string ) => {
        await type( passwordInput(), password );
        await type( confirmInput(), confirm );
    };
    const pressEnter = () => confirmInput().dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true } ) );

    const create = async ( token: string | null ) => {
        send = jest.fn().mockResolvedValue( new CrisBasicCommandResult() );
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap( token ? { token } : {} ) } } },
                // The AuthService of the Cris authentication hooks the endpoint and refreshes its session through sendAsync:
                // with no result, it stays anonymous.
                { provide: HttpCrisEndpoint, useValue: { ambientValuesOverride: {}, sendOrThrowAsync: send, addHook: jest.fn(), sendAsync: jest.fn().mockResolvedValue( {} ) } },
                { provide: NotificationService, useValue: { notifyUserMessage: jest.fn() } }
            ],
            imports: [RecoverPasswordForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        navigate = jest.spyOn( TestBed.inject( Router ), 'navigate' ).mockResolvedValue( true );
        fixture = TestBed.createComponent( RecoverPasswordForm );
        await render();
    };

    it( 'missing token shows the invalid token alert', async () => {
        await create( null );

        const alert = host().querySelector( 'nz-alert' );
        expect( alert?.textContent ).toContain( translate.instant( 'CK.Auth.RecoverPassword.InvalidToken' ) );
        expect( host().querySelector( 'ck-generic-form' ) ).toBeNull();
    } );

    it( 'mismatch shows CK.Auth.RecoverPassword.ConfirmPassword.Mismatch', async () => {
        await create( 'tok' );
        await fill( STRONG, STRONG + 'x' );

        expect( tipOf( 1 ) ).toBe( translate.instant( 'CK.Auth.RecoverPassword.ConfirmPassword.Mismatch' ) );
        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'emptied fields show CK.Auth.RecoverPassword.Password.Required and ConfirmPassword.Required', async () => {
        await create( 'tok' );
        await fill( 'x', 'x' );
        await fill( '', '' );

        expect( tipOf( 0 ) ).toBe( translate.instant( 'CK.Auth.RecoverPassword.Password.Required' ) );
        expect( tipOf( 1 ) ).toBe( translate.instant( 'CK.Auth.RecoverPassword.ConfirmPassword.Required' ) );
        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'a password missing a criterion keeps submit disabled', async () => {
        await create( 'tok' );
        await fill( 'abcdefg1!', 'abcdefg1!' );

        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'shows a strength meter under the password that follows what is typed', async () => {
        await create( 'tok' );
        const metCriteria = () => item( 0 ).querySelectorAll( 'ck-password-strength li.met' ).length;

        await type( passwordInput(), 'abc' );
        expect( metCriteria() ).toBe( 1 );

        await type( passwordInput(), STRONG );
        expect( metCriteria() ).toBe( 5 );
    } );

    it( 'submit sends RecoverPasswordCommand( token, password ) with currentCultureName and navigates to /auth when res.success', async () => {
        await create( 'tok' );
        await TestBed.inject( LocaleService ).setLocale( 'fr' );
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toBeInstanceOf( RecoverPasswordCommand );
        expect( send.mock.calls[0][0] ).toMatchObject( { token: 'tok', password: STRONG, currentCultureName: 'fr' } );
        expect( navigate ).toHaveBeenCalledWith( ['/auth'] );
    } );

    it( 'an unsuccessful result keeps the page', async () => {
        await create( 'tok' );
        const failed = new CrisBasicCommandResult();
        failed.success = false;
        send.mockResolvedValue( failed );
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( navigate ).not.toHaveBeenCalled();
        expect( passwordInput().value ).toBe( STRONG );
        expect( submitButton().disabled ).toBe( false );
    } );

    it( 'Enter in the form sends one command', async () => {
        await create( 'tok' );
        await fill( STRONG, STRONG );
        pressEnter();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toMatchObject( { token: 'tok', password: STRONG } );
    } );

    it( 'Enter twice while the command is in flight sends one command', async () => {
        await create( 'tok' );
        let reply!: ( value: CrisBasicCommandResult ) => void;
        send.mockReturnValue( new Promise<CrisBasicCommandResult>( resolve => reply = resolve ) );
        await fill( STRONG, STRONG );

        pressEnter();
        pressEnter();
        reply( new CrisBasicCommandResult() );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'submit disabled while submitting', async () => {
        await create( 'tok' );
        let reply!: ( value: CrisBasicCommandResult ) => void;
        send.mockReturnValue( new Promise<CrisBasicCommandResult>( resolve => reply = resolve ) );
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( submitButton().disabled ).toBe( true );
        expect( submitButton().classList ).toContain( 'ant-btn-loading' );

        reply( new CrisBasicCommandResult() );
        await render();
    } );

    it( 'a failed send enables submit again', async () => {
        await create( 'tok' );
        send.mockRejectedValue( new Error( 'offline' ) );
        await fill( STRONG, STRONG );

        // Called directly: a rejection from a template handler fails the test as an unhandled rejection.
        await fixture.componentInstance.submit().catch( () => undefined );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( navigate ).not.toHaveBeenCalled();
        expect( submitButton().disabled ).toBe( false );
    } );
} );
