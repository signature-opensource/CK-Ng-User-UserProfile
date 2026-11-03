import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    CrisBasicCommandResult,
    HttpCrisEndpoint,
    NotificationService,
    PasswordLostForm,
    SendForgotPasswordEmailCommand
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';
import { appConfig } from './app.config';

describe( 'ck-password-lost-form', () => {
    let fixture: ComponentFixture<PasswordLostForm>;
    let send: jest.Mock;
    let translate: TranslateService;

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const emailInput = () => host().querySelector( 'nz-form-item input' ) as HTMLInputElement;
    const tip = () => host().querySelector( 'nz-form-item .ant-form-item-explain-error' )?.textContent?.trim() ?? '';
    const submitButton = () => host().querySelector( '.ck-password-lost-form-submit' ) as HTMLButtonElement;
    const type = async ( text: string ) => {
        emailInput().value = text;
        emailInput().dispatchEvent( new Event( 'input' ) );
        emailInput().dispatchEvent( new Event( 'blur' ) );
        await render();
    };
    const pressEnter = () => emailInput().dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true } ) );

    beforeEach( async () => {
        send = jest.fn().mockResolvedValue( new CrisBasicCommandResult() );
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: HttpCrisEndpoint, useValue: { sendOrThrowAsync: send } },
                { provide: NotificationService, useValue: { notifyUserMessage: jest.fn() } }
            ],
            imports: [PasswordLostForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        fixture = TestBed.createComponent( PasswordLostForm );
        await render();
    } );

    it( 'empty e-mail shows CK.Auth.PasswordLost.Email.Required', async () => {
        await type( 'x' );
        await type( '' );

        expect( tip() ).toBe( translate.instant( 'CK.Auth.PasswordLost.Email.Required' ) );
    } );

    it( 'malformed e-mail shows CK.Auth.PasswordLost.Email.Invalid', async () => {
        await type( 'alice@' );

        expect( tip() ).toBe( translate.instant( 'CK.Auth.PasswordLost.Email.Invalid' ) );
        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'submit sends SendForgotPasswordEmailCommand with the trimmed e-mail and currentCultureName', async () => {
        await TestBed.inject( LocaleService ).setLocale( 'fr' );
        await type( '  alice@example.com  ' );
        submitButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toBeInstanceOf( SendForgotPasswordEmailCommand );
        expect( send.mock.calls[0][0] ).toMatchObject( { email: 'alice@example.com', currentCultureName: 'fr' } );
        expect( host().querySelector( '.ck-password-lost-form-confirmation' ) ).not.toBeNull();
    } );

    it( 'submit disabled while submitting', async () => {
        let reply!: ( value: CrisBasicCommandResult ) => void;
        send.mockReturnValue( new Promise<CrisBasicCommandResult>( resolve => reply = resolve ) );
        await type( 'alice@example.com' );
        submitButton().click();
        await render();

        expect( submitButton().disabled ).toBe( true );
        expect( submitButton().classList ).toContain( 'ant-btn-loading' );

        reply( new CrisBasicCommandResult() );
        await render();
    } );

    it( 'Enter in the e-mail sends one command', async () => {
        await type( 'alice@example.com' );
        pressEnter();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toMatchObject( { email: 'alice@example.com' } );
    } );

    it( 'Enter twice while the command is in flight sends one command', async () => {
        let reply!: ( value: CrisBasicCommandResult ) => void;
        send.mockReturnValue( new Promise<CrisBasicCommandResult>( resolve => reply = resolve ) );
        await type( 'alice@example.com' );

        pressEnter();
        pressEnter();
        reply( new CrisBasicCommandResult() );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'a failed send enables submit again', async () => {
        send.mockRejectedValue( new Error( 'offline' ) );
        await type( 'alice@example.com' );

        // Called directly: a rejection from a template handler fails the test as an unhandled rejection.
        await fixture.componentInstance.submit().catch( () => undefined );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( submitButton().disabled ).toBe( false );
    } );
} );
