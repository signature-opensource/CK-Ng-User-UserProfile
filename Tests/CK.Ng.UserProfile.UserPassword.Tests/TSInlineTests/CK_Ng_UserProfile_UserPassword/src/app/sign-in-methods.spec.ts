import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, NotificationService, BasicLoginCommand, RemovePasswordCommand, SignInMethods, PasswordSection } from '@local/ck-gen';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

function basicLogin( userName: string, password: string ): BasicLoginCommand {
    const c = new BasicLoginCommand();
    c.userName = userName;
    c.password = password;
    return c;
}

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// In its own file: the AXIOS instance of CKGenAppModule is created once per file.
describe( 'The Sign-in methods tab and its password section', () => {
    let ngAuthService: NgAuthService;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                providers: [...CKGenAppModule.Providers, provideNoopAnimations()]
            } ).compileComponents();
        ngAuthService = TestBed.inject( NgAuthService );
        await ngAuthService.authService.isInitialized;
        await TestBed.inject( HttpCrisEndpoint ).updateAmbientValuesAsync();
        await TestBed.inject( HttpCrisEndpoint ).sendOrThrowAsync( basicLogin( 'TestUser', 'success' ) );
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
        ngAuthService.authService.close();
    } );

    it( 'lists the sign-in methods of the user', async () => {
        const tab = TestBed.createComponent( SignInMethods ).componentInstance;
        const basic = tab.methods().find( m => m.scheme === 'Basic' );
        expect( basic ).toBeDefined();
        // The lastUsed is displayed: the Basic login just happened.
        expect( basic!.lastUsed.length ).toBeGreaterThan( 0 );
        expect( tab.schemeName( 'Oidc.Google' ) ).toBe( 'Google' );
    } );

    it( 'shows the change mode for a user that has a password, and never removes it below the Critical level', async () => {
        // This host gives no Critical level to the Basic logins.
        expect( ngAuthService.level() ).toBe( AuthLevel.Normal );
        const fixture = TestBed.createComponent( PasswordSection );
        const section = fixture.componentInstance;
        expect( section.hasPassword() ).toBe( true );

        const notif = TestBed.inject( NotificationService );
        const communicationErrors = jest.spyOn( notif, 'notifyGenericCommunicationError' ).mockImplementation( () => {} );
        const send = jest.spyOn( TestBed.inject( HttpCrisEndpoint ), 'sendOrThrowAsync' );
        // The button is disabled below the Critical level; the server refuses the command anyway.
        await section.removeAsync();
        expect( send.mock.calls.some( c => c[0] instanceof RemovePasswordCommand ) ).toBe( true );
        expect( communicationErrors ).toHaveBeenCalled();
        expect( section.hasPassword() ).toBe( true );
    } );
} );
