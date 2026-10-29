import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, GetUserProfileQCommand } from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BasicLoginCommand } from '@local/ck-gen';

function basicLogin( userName: string, password: string ): BasicLoginCommand {
    const c = new BasicLoginCommand();
    c.userName = userName;
    c.password = password;
    return c;
}

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

describe( 'integration tests', () => {
    let ngAuthService: NgAuthService;
    let cris: HttpCrisEndpoint;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                imports: [AppComponent],
                providers: [...CKGenAppModule.Providers, { provide: ComponentFixtureAutoDetect, useValue: true }]
            } ).compileComponents();

        ngAuthService = TestBed.inject( NgAuthService );
        await ngAuthService.authService.isInitialized;
        cris = TestBed.inject( HttpCrisEndpoint );
        await cris.updateAmbientValuesAsync();
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
        ngAuthService.authService.close();
    } );

    it( 'should be able to get profile', async () => {
        const authService = ngAuthService.authService;

        expect( authService.level ).toBe( AuthLevel.None );
        expect( ( await authService.refreshSchemesAsync() ).length ).toBeGreaterThan( 0 );

        expect( ngAuthService.authenticationInfo() ).toStrictEqual( authService.authenticationInfo );
        await cris.sendOrThrowAsync( basicLogin( 'TestUser', 'success' ) );
        expect( ngAuthService.level() ).toBeGreaterThanOrEqual( AuthLevel.Normal );
        expect( ngAuthService.authenticationInfo() ).toStrictEqual( authService.authenticationInfo );
        await cris.updateAmbientValuesAsync();

        const profile = await cris.sendOrThrowAsync( new GetUserProfileQCommand( authService.actor.actorId ) );
        expect( profile ).not.toBeNull();
        expect( profile!.userName ).toBe( 'TestUser' );
    } );
} );
