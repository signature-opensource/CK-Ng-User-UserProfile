import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthLevel, BasicLoginCommand, HttpCrisEndpoint, NgAuthService, NotificationService, OidcIdentities } from '@local/ck-gen';

function basicLogin( userName: string, password: string ): BasicLoginCommand {
    const c = new BasicLoginCommand();
    c.userName = userName;
    c.password = password;
    return c;
}

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// In its own file: the AXIOS instance of CKGenAppModule is created once per file.
describe( 'OidcIdentities', () => {
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
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
        ngAuthService.authService.close();
    } );

    it( 'lists the identities, their claims, unlinks them and proposes the providers to link', async () => {
        const section = TestBed.createComponent( OidcIdentities ).componentInstance;
        await section.ngOnInit();
        const ids = section.identities();
        expect( ids.map( i => i.schemeSuffix ) ).toEqual( ['Test'] );
        expect( ids[0].account ).toBe( 'test@example.com' );
        expect( ids[0].claims.map( c => c.name ) ).toEqual( ['email', 'name'] );
        // The Test provider is linked: there is nothing else to link.
        expect( section.linkable() ).toEqual( [] );

        // At the Critical level, the identity is unlinked (the user keeps its password).
        await section.unlinkAsync( ids[0] );
        expect( section.identities() ).toEqual( [] );
        expect( section.linkable() ).toEqual( ['Oidc.Test'] );
    } );
} );
