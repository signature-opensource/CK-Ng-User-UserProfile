import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    HttpCrisEndpoint,
    NotificationService,
    SetUserExtendedCultureCommand,
    UpdateUserCommand,
    UserProfile,
    UserService,
    UserUpdateForm
} from '@local/ck-gen';
import { locales } from '@local/ck-gen/ts-locales/locales';
import { appConfig } from './app.config';

describe( 'ck-user-update-form with PreferredCulture', () => {
    let fixture: ComponentFixture<UserUpdateForm>;
    let send: jest.Mock;
    let translate: TranslateService;

    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const itemOf = ( labelKey: string ) => Array.from( host().querySelectorAll( 'nz-form-item' ) )
        .find( i => i.querySelector( 'nz-form-label' )?.textContent?.trim() === translate.instant( labelKey ) )!;
    const updateButton = () => host().querySelectorAll<HTMLButtonElement>( '.ck-update-user-actions button' )[1];

    beforeEach( async () => {
        send = jest.fn().mockResolvedValue( { success: true } );
        const profile = new UserProfile();
        profile.userId = 7;
        profile.userName = 'Alice';
        profile.extendedCultureId = locales['en'].id;
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: UserService, useValue: { userProfile: signal( profile ), refreshUserProfileAsync: jest.fn().mockResolvedValue( undefined ) } },
                { provide: HttpCrisEndpoint, useValue: { sendOrThrowAsync: send } },
                { provide: NotificationService, useValue: { notifySimpleMessage: jest.fn(), notifyGenericCommunicationError: jest.fn() } }
            ],
            imports: [UserUpdateForm]
        } ).compileComponents();
        translate = TestBed.inject( TranslateService );
        await firstValueFrom( translate.use( 'en' ) );
        fixture = TestBed.createComponent( UserUpdateForm );
        await render();
    } );

    it( 'sends SetUserExtendedCultureCommand with the locale id of the chosen language', async () => {
        const select = itemOf( 'CK.UserProfile.PreferredCultureName' ).querySelector( 'nz-select' ) as HTMLElement;
        select.querySelector<HTMLElement>( '.ant-select-selector' )!.click();
        await render();
        const french = Array.from( document.querySelectorAll<HTMLElement>( 'nz-option-item' ) )
            .find( o => o.textContent?.trim() === locales['fr'].nativeName )!;
        french.click();
        await render();
        updateButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        const commands = ( send.mock.calls[0][0] as UpdateUserCommand ).commands.map( c => c.command );
        expect( commands.length ).toBe( 1 );
        expect( commands[0] ).toBeInstanceOf( SetUserExtendedCultureCommand );
        expect( commands[0] ).toMatchObject( { userId: 7, extendedCultureId: locales['fr'].id } );
    } );
} );
