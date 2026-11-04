import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    HttpCrisEndpoint,
    NotificationService,
    SetUserNameCommand,
    UpdateUserCommand,
    UserProfile,
    UserService,
    UserUpdateForm
} from '@local/ck-gen';
import { appConfig } from './app.config';

describe( 'ck-user-update-form', () => {
    let fixture: ComponentFixture<UserUpdateForm>;
    let profile: WritableSignal<UserProfile | undefined>;
    let send: jest.Mock;
    let translate: TranslateService;

    const aliceProfile = () => new UserProfile( 7, 'Alice' );

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const itemOf = ( labelKey: string ) => Array.from( host().querySelectorAll( 'nz-form-item' ) )
        .find( i => i.querySelector( 'nz-form-label' )?.textContent?.trim() === translate.instant( labelKey ) );
    const userNameInput = () => itemOf( 'CK.UserProfile.UserName' )!.querySelector( 'input' ) as HTMLInputElement;
    const cancelButton = () => host().querySelectorAll<HTMLButtonElement>( '.ck-update-user-actions button' )[0];
    const updateButton = () => host().querySelectorAll<HTMLButtonElement>( '.ck-update-user-actions button' )[1];
    const type = async ( input: HTMLInputElement, text: string ) => {
        input.value = text;
        input.dispatchEvent( new Event( 'input' ) );
        input.dispatchEvent( new Event( 'blur' ) );
        await render();
    };
    const sentCommands = () => ( send.mock.calls[0][0] as UpdateUserCommand ).commands.map( c => c.command );

    beforeEach( async () => {
        profile = signal<UserProfile | undefined>( aliceProfile() );
        send = jest.fn().mockResolvedValue( { success: true } );
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: UserService, useValue: { userProfile: profile, refreshUserProfileAsync: jest.fn().mockResolvedValue( undefined ) } },
                // The AuthService of the Cris authentication hooks the endpoint and refreshes its session through sendAsync:
                // with no result, it stays anonymous.
                { provide: HttpCrisEndpoint, useValue: { ambientValuesOverride: {}, sendOrThrowAsync: send, addHook: jest.fn(), sendAsync: jest.fn().mockResolvedValue( {} ) } },
                { provide: NotificationService, useValue: { notifySimpleMessage: jest.fn(), notifyGenericCommunicationError: jest.fn() } }
            ],
            imports: [UserUpdateForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        fixture = TestBed.createComponent( UserUpdateForm );
        await render();
    } );

    it( 'fills the user name when the profile arrives after the form', async () => {
        profile.set( undefined );
        fixture = TestBed.createComponent( UserUpdateForm );
        await render();
        expect( itemOf( 'CK.UserProfile.UserName' ) ).toBeUndefined();

        profile.set( aliceProfile() );
        await render();
        expect( userNameInput().value ).toBe( 'Alice' );
    } );

    it( 'keeps Update and Cancel disabled until a change', async () => {
        expect( updateButton().disabled ).toBe( true );
        expect( cancelButton().disabled ).toBe( true );

        await type( userNameInput(), 'Bob' );
        expect( updateButton().disabled ).toBe( false );
        expect( cancelButton().disabled ).toBe( false );
    } );

    it( 'shows the required message on an empty user name and keeps Update disabled', async () => {
        await type( userNameInput(), '' );
        expect( itemOf( 'CK.UserProfile.UserName' )!.querySelector( '.form-control-error' )?.textContent?.trim() )
            .toBe( translate.instant( 'CK.UserProfile.Form.UserNameRequired' ) );
        expect( updateButton().disabled ).toBe( true );
    } );

    it( 'sends SetUserNameCommand with the trimmed user name on Update', async () => {
        await type( userNameInput(), '  Bob  ' );
        updateButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        const commands = sentCommands();
        expect( commands.length ).toBe( 1 );
        expect( commands[0] ).toBeInstanceOf( SetUserNameCommand );
        expect( commands[0] ).toMatchObject( { userId: 7, userName: 'Bob' } );
    } );

    it( 'restores the profile values and clears the change on Cancel', async () => {
        await type( userNameInput(), 'Bob' );
        cancelButton().click();
        await render();

        expect( userNameInput().value ).toBe( 'Alice' );
        expect( updateButton().disabled ).toBe( true );
        expect( cancelButton().disabled ).toBe( true );
    } );

    it( 'keeps the typed user name when the language changes', async () => {
        await type( userNameInput(), 'Bob' );
        translate.setTranslation( 'xx', {} );
        await firstValueFrom( translate.use( 'xx' ) );
        await render();

        expect( userNameInput().value ).toBe( 'Bob' );
        expect( updateButton().disabled ).toBe( false );
    } );

    it( 'shows no required mark on the user name', () => {
        expect( itemOf( 'CK.UserProfile.UserName' )!.querySelector( '.ant-form-item-required' ) ).toBeNull();
    } );
} );
