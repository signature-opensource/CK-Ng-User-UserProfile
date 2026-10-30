import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthLevel, BasicLoginCommand, HttpCrisEndpoint, NgAuthService, NotificationService, PasskeyList } from '@local/ck-gen';

function basicLogin( userName: string, password: string ): BasicLoginCommand {
    const c = new BasicLoginCommand();
    c.userName = userName;
    c.password = password;
    return c;
}

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// In its own file: the AXIOS instance of CKGenAppModule is created once per file.
describe( 'PasskeyList', () => {
    let ngAuthService: NgAuthService;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                providers: [...CKGenAppModule.Providers, provideNoopAnimations()]
            } ).compileComponents();
        ngAuthService = TestBed.inject( NgAuthService );
        await ngAuthService.authService.isInitialized;
        await TestBed.inject( HttpCrisEndpoint ).updateAmbientValuesAsync();
        // The Basic logins of this host reach the Critical level.
        await TestBed.inject( HttpCrisEndpoint ).sendOrThrowAsync( basicLogin( 'TestUser', 'success' ) );
        expect( ngAuthService.level() ).toBe( AuthLevel.Critical );
        jest.spyOn( TestBed.inject( NotificationService ), 'notifySimpleMessage' ).mockImplementation( () => {} );
    }, 30000 ); // The login of the setup: a loaded machine can exceed the default 5 seconds.

    afterEach( async () => {
        await ngAuthService.authService.logout();
        ngAuthService.authService.close();
    } );

    it( 'lists, renames and deletes the passkeys of the user', async () => {
        const list = TestBed.createComponent( PasskeyList ).componentInstance;
        await list.refreshAsync();
        expect( list.passkeys().map( p => p.name ) ).toEqual( ['Seeded key'] );
        const p = list.passkeys()[0];
        expect( list.formatDate( p.lastUsedTime ) ).toBe( 'never' );

        list.startRename( p );
        expect( list.isValidName( '   ' ) ).toBe( false );
        list.editedName = 'My laptop';
        await list.renameAsync( p );
        expect( list.editingId() ).toBeUndefined();
        expect( list.passkeys().map( p => p.name ) ).toEqual( ['My laptop'] );

        // At the Critical level, the passkey is deleted (the user keeps its password).
        await list.deleteAsync( list.passkeys()[0] );
        // (The array comes from another realm: toEqual( [] ) compares the prototypes.)
        expect( list.passkeys().length ).toBe( 0 );
    } );
} );
