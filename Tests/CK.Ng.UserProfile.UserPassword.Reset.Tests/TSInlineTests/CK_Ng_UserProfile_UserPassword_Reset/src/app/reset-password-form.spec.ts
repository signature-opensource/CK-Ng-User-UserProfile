import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    CrisBasicCommandResult,
    HttpCrisEndpoint,
    NotificationService,
    ResetPasswordForm,
    SetPasswordCommand,
    UserService
} from '@local/ck-gen';
import { appConfig } from './app.config';

describe( 'ck-reset-password-form', () => {
    const STRONG = 'Abcdefg1!';
    const USER_ID = 3712;

    let fixture: ComponentFixture<ResetPasswordForm>;
    let send: jest.Mock;
    let refresh: jest.Mock;
    let notifySimpleMessage: jest.Mock;
    let notifyGenericCommunicationError: jest.Mock;
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
    const submitButton = () => host().querySelector( '.ck-reset-password-submit' ) as HTMLButtonElement;
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
    const pendingReply = () => {
        let reply!: ( value: CrisBasicCommandResult ) => void;
        send.mockReturnValue( new Promise<CrisBasicCommandResult>( resolve => reply = resolve ) );
        return ( value: CrisBasicCommandResult ) => reply( value );
    };

    beforeEach( async () => {
        send = jest.fn().mockResolvedValue( new CrisBasicCommandResult() );
        refresh = jest.fn().mockResolvedValue( undefined );
        notifySimpleMessage = jest.fn();
        notifyGenericCommunicationError = jest.fn();
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: HttpCrisEndpoint, useValue: { sendOrThrowAsync: send } },
                { provide: NotificationService, useValue: { notifyUserMessage: jest.fn(), notifySimpleMessage, notifyGenericCommunicationError } },
                { provide: UserService, useValue: { userProfile: signal( { userId: USER_ID } ), refreshUserProfileAsync: refresh } }
            ],
            imports: [ResetPasswordForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        navigate = jest.spyOn( TestBed.inject( Router ), 'navigate' ).mockResolvedValue( true );
        fixture = TestBed.createComponent( ResetPasswordForm );
        await render();
    } );

    it( 'mismatch shows CK.Auth.ResetPassword.ConfirmPassword.Mismatch', async () => {
        await fill( STRONG, STRONG + 'x' );

        expect( tipOf( 1 ) ).toBe( translate.instant( 'CK.Auth.ResetPassword.ConfirmPassword.Mismatch' ) );
    } );

    it( 'emptied fields show CK.Auth.ResetPassword.Password.Required and ConfirmPassword.Required', async () => {
        await fill( 'x', 'x' );
        await fill( '', '' );

        expect( tipOf( 0 ) ).toBe( translate.instant( 'CK.Auth.ResetPassword.Password.Required' ) );
        expect( tipOf( 1 ) ).toBe( translate.instant( 'CK.Auth.ResetPassword.ConfirmPassword.Required' ) );
        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'submit disabled while invalid: a password missing a criterion', async () => {
        await fill( 'abcdefg1!', 'abcdefg1!' );

        expect( submitButton().disabled ).toBe( true );
    } );

    it( 'shows a strength meter under the password that follows what is typed', async () => {
        const metCriteria = () => item( 0 ).querySelectorAll( 'ck-password-strength li.met' ).length;

        await type( passwordInput(), 'abc' );
        expect( metCriteria() ).toBe( 1 );

        await type( passwordInput(), STRONG );
        expect( metCriteria() ).toBe( 5 );
    } );

    it( 'submit sends SetPasswordCommand( userId, password ), refreshes the profile and navigates to / when res.success', async () => {
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toBeInstanceOf( SetPasswordCommand );
        expect( send.mock.calls[0][0] ).toMatchObject( { userId: USER_ID, password: STRONG, isTemporary: false } );
        expect( refresh ).toHaveBeenCalledTimes( 1 );
        expect( notifySimpleMessage ).toHaveBeenCalledWith( 'success', translate.instant( 'CK.Auth.ResetPassword.Success' ) );
        expect( navigate ).toHaveBeenCalledWith( ['/'] );
        // The guard reads the refreshed profile: navigating first would bounce back here.
        expect( refresh.mock.invocationCallOrder[0] ).toBeLessThan( navigate.mock.invocationCallOrder[0] );
    } );

    it( 'an unsuccessful result keeps the page and notifies CK.Auth.ResetPassword.Failed', async () => {
        const failed = new CrisBasicCommandResult();
        failed.success = false;
        send.mockResolvedValue( failed );
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( notifySimpleMessage ).toHaveBeenCalledWith( 'error', translate.instant( 'CK.Auth.ResetPassword.Failed' ) );
        expect( refresh ).not.toHaveBeenCalled();
        expect( navigate ).not.toHaveBeenCalled();
        expect( passwordInput().value ).toBe( STRONG );
        expect( submitButton().disabled ).toBe( false );
    } );

    it( 'Enter twice while the command is in flight sends one command', async () => {
        const reply = pendingReply();
        await fill( STRONG, STRONG );

        pressEnter();
        pressEnter();
        reply( new CrisBasicCommandResult() );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( send.mock.calls[0][0] ).toMatchObject( { userId: USER_ID, password: STRONG } );
    } );

    it( 'submit disabled and loading while the command is in flight', async () => {
        const reply = pendingReply();
        await fill( STRONG, STRONG );
        submitButton().click();
        await render();

        expect( submitButton().disabled ).toBe( true );
        expect( submitButton().classList ).toContain( 'ant-btn-loading' );

        reply( new CrisBasicCommandResult() );
        await render();
    } );

    it( 'a send that throws shows the communication error and enables submit again', async () => {
        send.mockRejectedValue( new Error( 'offline' ) );
        await fill( STRONG, STRONG );

        // Called directly so a rejection escaping submit() fails this test's assertions, not jest as an unhandled rejection.
        await fixture.componentInstance.submit().catch( () => undefined );
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        expect( notifyGenericCommunicationError ).toHaveBeenCalledTimes( 1 );
        expect( navigate ).not.toHaveBeenCalled();
        expect( submitButton().disabled ).toBe( false );
    } );
} );
