import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    HttpCrisEndpoint,
    NotificationService,
    SetUserNamesCommand,
    UpdateUserCommand,
    UserProfile,
    UserService,
    UserUpdateForm
} from '@local/ck-gen';
import { appConfig } from './app.config';

describe( 'ck-user-update-form with NamedUser', () => {
    let fixture: ComponentFixture<UserUpdateForm>;
    let send: jest.Mock;
    let translate: TranslateService;

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const inputOf = ( labelKey: string ) => Array.from( host().querySelectorAll( 'nz-form-item' ) )
        .find( i => i.querySelector( 'nz-form-label' )?.textContent?.trim() === translate.instant( labelKey ) )!
        .querySelector( 'input' ) as HTMLInputElement;
    const updateButton = () => host().querySelectorAll<HTMLButtonElement>( '.ck-update-user-actions button' )[1];

    beforeEach( async () => {
        send = jest.fn().mockResolvedValue( { success: true } );
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: UserService, useValue: { userProfile: signal( new UserProfile( 7, 'Alice', 'Ann', 'Lee' ) ), refreshUserProfileAsync: jest.fn().mockResolvedValue( undefined ) } },
                // The AuthService of the Cris authentication hooks the endpoint and refreshes its session through sendAsync:
                // with no result, it stays anonymous.
                { provide: HttpCrisEndpoint, useValue: { sendOrThrowAsync: send, addHook: jest.fn(), sendAsync: jest.fn().mockResolvedValue( {} ) } },
                { provide: NotificationService, useValue: { notifySimpleMessage: jest.fn(), notifyGenericCommunicationError: jest.fn() } }
            ],
            imports: [UserUpdateForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        fixture = TestBed.createComponent( UserUpdateForm );
        await render();
    } );

    it( 'sends SetUserNamesCommand with the new first name and no last name when only the first name changes', async () => {
        const firstName = inputOf( 'CK.UserProfile.FirstName' );
        firstName.value = ' Bob ';
        firstName.dispatchEvent( new Event( 'input' ) );
        await render();
        updateButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        const commands = ( send.mock.calls[0][0] as UpdateUserCommand ).commands.map( c => c.command );
        expect( commands.length ).toBe( 1 );
        expect( commands[0] ).toBeInstanceOf( SetUserNamesCommand );
        expect( commands[0] ).toMatchObject( { userId: 7, firstName: 'Bob', lastName: null } );
    } );
} );
