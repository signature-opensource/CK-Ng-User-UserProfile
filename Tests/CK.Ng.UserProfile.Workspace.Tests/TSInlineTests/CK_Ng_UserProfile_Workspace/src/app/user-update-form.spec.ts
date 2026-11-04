import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
    GroupInfos,
    HttpCrisEndpoint,
    NotificationService,
    SetPreferredWorkspaceIdCommand,
    UpdateUserCommand,
    UserGroup,
    UserProfile,
    UserService,
    UserUpdateForm
} from '@local/ck-gen';
import { appConfig } from './app.config';

describe( 'ck-user-update-form with Workspace', () => {
    let fixture: ComponentFixture<UserUpdateForm>;
    let send: jest.Mock;
    let translate: TranslateService;

    const groupOf = ( groupId: number, groupName: string, isZone: boolean ) => {
        const g = new UserGroup();
        g.group = new GroupInfos();
        g.group.groupId = groupId;
        g.group.groupName = groupName;
        g.group.isZone = isZone;
        return g;
    };
    const render = async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const host = () => fixture.nativeElement as HTMLElement;
    const itemOf = ( labelKey: string ) => Array.from( host().querySelectorAll( 'nz-form-item' ) )
        .find( i => i.querySelector( 'nz-form-label' )?.textContent?.trim() === translate.instant( labelKey ) );
    const updateButton = () => host().querySelectorAll<HTMLButtonElement>( '.ck-update-user-actions button' )[1];
    const setUp = async ( groups: UserGroup[] ) => {
        send = jest.fn().mockResolvedValue( { success: true } );
        const profile = new UserProfile( 7, 'Alice', 1, groups );
        await TestBed.configureTestingModule( {
            providers: [
                ...appConfig.providers,
                { provide: UserService, useValue: { userProfile: signal( profile ), refreshUserProfileAsync: jest.fn().mockResolvedValue( undefined ) } },
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
    };

    it( 'hides the workspace select when the user belongs to no zone', async () => {
        await setUp( [groupOf( 3, 'Team', false )] );

        expect( itemOf( 'CK.UserProfile.UserName' ) ).toBeDefined();
        expect( itemOf( 'CK.UserProfile.PreferredWorkspace' ) ).toBeUndefined();
    } );

    it( 'sends SetPreferredWorkspaceIdCommand with the chosen workspace', async () => {
        await setUp( [groupOf( 1, 'North', true ), groupOf( 2, 'South', true )] );

        const select = itemOf( 'CK.UserProfile.PreferredWorkspace' )!.querySelector( 'nz-select' ) as HTMLElement;
        select.querySelector<HTMLElement>( '.ant-select-selector' )!.click();
        await render();
        const south = Array.from( document.querySelectorAll<HTMLElement>( 'nz-option-item' ) )
            .find( o => o.textContent?.trim() === 'South' )!;
        south.click();
        await render();
        updateButton().click();
        await render();

        expect( send ).toHaveBeenCalledTimes( 1 );
        const commands = ( send.mock.calls[0][0] as UpdateUserCommand ).commands.map( c => c.command );
        expect( commands.length ).toBe( 1 );
        expect( commands[0] ).toBeInstanceOf( SetPreferredWorkspaceIdCommand );
        expect( commands[0] ).toMatchObject( { userId: 7, workspaceId: 2 } );
    } );
} );
