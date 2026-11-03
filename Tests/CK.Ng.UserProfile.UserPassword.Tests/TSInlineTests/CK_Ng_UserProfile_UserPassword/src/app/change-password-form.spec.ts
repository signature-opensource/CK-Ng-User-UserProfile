import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    AuthLevel,
    ChangePasswordForm,
    HttpCrisEndpoint,
    NgAuthService,
    NotificationService,
    SetPasswordCommand,
    UserProfile,
    UserService
} from '@local/ck-gen';
import { appConfig } from './app.config';

describe( 'ck-change-password-form', () => {
    const STRONG = 'Abcdefg1!';

    let fixture: ComponentFixture<ChangePasswordForm>;
    let send: jest.Mock;
    let notifySimpleMessage: jest.Mock;
    let translate: TranslateService;

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const itemOf = ( labelKey: string ) => Array.from( host().querySelectorAll( 'nz-form-item' ) )
        .find( i => i.querySelector( 'nz-form-label' )?.textContent?.trim() === translate.instant( labelKey ) )!;
    const passwordInput = () => itemOf( 'CK.UserProfile.Password' ).querySelector( 'input' ) as HTMLInputElement;
    const repeatInput = () => itemOf( 'CK.UserProfile.RepeatPassword' ).querySelector( 'input' ) as HTMLInputElement;
    const tipOf = ( labelKey: string ) => itemOf( labelKey ).querySelector( '.ant-form-item-explain-error' )?.textContent?.trim() ?? '';
    const cancelButton = () => host().querySelectorAll<HTMLButtonElement>( '.form-buttons button' )[0];
    const confirmButton = () => host().querySelectorAll<HTMLButtonElement>( '.form-buttons button' )[1];
    const type = async ( input: HTMLInputElement, text: string ) => {
        input.value = text;
        input.dispatchEvent( new Event( 'input' ) );
        input.dispatchEvent( new Event( 'blur' ) );
        await render();
    };
    const fill = async ( password: string, repeat: string ) => {
        await type( passwordInput(), password );
        await type( repeatInput(), repeat );
    };
    const pressEnter = () => repeatInput().dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Enter', bubbles: true } ) );

    beforeEach( async () => {
        send = jest.fn().mockResolvedValue( true );
        notifySimpleMessage = jest.fn();
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: UserService, useValue: { userProfile: signal( new UserProfile( 7, 'Alice' ) ) } },
                // Changing a password requires the Critical level (see change-password-form.critical.spec.ts).
                { provide: NgAuthService, useValue: { level: signal( AuthLevel.Critical ) } },
                { provide: HttpCrisEndpoint, useValue: { sendOrThrowAsync: send } },
                { provide: NotificationService, useValue: { notifySimpleMessage, notifyGenericCommunicationError: jest.fn() } }
            ],
            imports: [ChangePasswordForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        fixture = TestBed.createComponent( ChangePasswordForm );
        await render();
    } );

    it( 'keeps Confirm disabled until both passwords match and are complex', async () => {
        expect( confirmButton().disabled ).toBe( true );

        await fill( 'abc', 'abc' );
        expect( confirmButton().disabled ).toBe( true );

        await fill( STRONG, STRONG + 'x' );
        expect( confirmButton().disabled ).toBe( true );

        await fill( STRONG, STRONG );
        expect( confirmButton().disabled ).toBe( false );
    } );

    it( 'shows CK.UserProfile.Form.PasswordRequired on an empty password', async () => {
        await type( passwordInput(), 'x' );
        await type( passwordInput(), '' );

        expect( tipOf( 'CK.UserProfile.Password' ) ).toBe( translate.instant( 'CK.UserProfile.Form.PasswordRequired' ) );
    } );

    it( 'shows CK.UserProfile.Form.PasswordMustMatch on a different repeat', async () => {
        await fill( STRONG, STRONG + 'x' );

        expect( tipOf( 'CK.UserProfile.RepeatPassword' ) ).toBe( translate.instant( 'CK.UserProfile.Form.PasswordMustMatch' ) );
    } );

    it( 'shows a strength meter that follows the typed password', async () => {
        const metCriteria = () => itemOf( 'CK.UserProfile.Password' ).querySelectorAll( 'ck-password-strength li.met' ).length;

        await type( passwordInput(), 'abc' );
        expect( metCriteria() ).toBe( 1 );

        await type( passwordInput(), STRONG );
        expect( metCriteria() ).toBe( 5 );
    } );

    it( 'sends SetPasswordCommand with the user id and password on Confirm, then clears the form', async () => {
        await fill( STRONG, STRONG );
        confirmButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toBeInstanceOf( SetPasswordCommand );
        expect( send.mock.calls[0][0] ).toMatchObject( { userId: 7, password: STRONG } );
        expect( notifySimpleMessage ).toHaveBeenCalledWith( 'success', translate.instant( 'User.PasswordSet' ) );
        expect( passwordInput().value ).toBe( '' );
        expect( repeatInput().value ).toBe( '' );
        expect( host().querySelector( '.ant-form-item-explain-error' ) ).toBeNull();
    } );

    it( 'sends again on a new Confirm after a failed send', async () => {
        send.mockRejectedValueOnce( new Error( 'offline' ) );
        await fill( STRONG, STRONG );

        // Called directly: a rejection from a template handler fails the test with "thrown: undefined".
        await expect( fixture.componentInstance.setPasswordAsync() ).rejects.toBeUndefined();
        await expect( fixture.componentInstance.setPasswordAsync() ).resolves.toBeUndefined();

        expect( send ).toHaveBeenCalledTimes( 2 );
    } );

    it( 'shows no required mark on either label', () => {
        expect( itemOf( 'CK.UserProfile.Password' ).querySelector( '.ant-form-item-required' ) ).toBeNull();
        expect( itemOf( 'CK.UserProfile.RepeatPassword' ).querySelector( '.ant-form-item-required' ) ).toBeNull();
    } );

    it( 'clears the form on Cancel', async () => {
        await fill( STRONG, 'x' );
        cancelButton().click();
        await render();

        expect( passwordInput().value ).toBe( '' );
        expect( repeatInput().value ).toBe( '' );
        expect( host().querySelector( '.ant-form-item-explain-error' ) ).toBeNull();
        expect( send ).not.toHaveBeenCalled();
    } );

    it( 'submits on Enter', async () => {
        await fill( STRONG, STRONG );
        pressEnter();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toMatchObject( { userId: 7, password: STRONG } );
    } );

    it( 'sends one command when Enter is pressed twice before the reply', async () => {
        let reply!: ( value: boolean ) => void;
        send.mockReturnValue( new Promise<boolean>( resolve => reply = resolve ) );
        await fill( STRONG, STRONG );

        pressEnter();
        pressEnter();
        reply( true );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
    } );
} );
