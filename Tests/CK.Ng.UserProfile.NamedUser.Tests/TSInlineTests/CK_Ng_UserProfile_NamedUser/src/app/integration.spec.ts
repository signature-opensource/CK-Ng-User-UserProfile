import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, GetUserProfileQCommand } from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

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
    } );

    it( 'should be able to get profile', async () => {
        const authService = ngAuthService.authService;

        expect( authService.authenticationInfo.level ).toBe( AuthLevel.None );
        expect( authService.availableSchemes.length ).toBeGreaterThan( 0 );

        expect( ngAuthService.authenticationInfo() ).toStrictEqual( authService.authenticationInfo );
        await authService.basicLogin( 'TestUser', 'success' );
        expect( ngAuthService.authenticationInfo().level ).toBe( AuthLevel.Normal );
        expect( ngAuthService.authenticationInfo() ).toStrictEqual( authService.authenticationInfo );
        await cris.updateAmbientValuesAsync();

        const profile = await cris.sendOrThrowAsync( new GetUserProfileQCommand( authService.authenticationInfo.user.userId ) );
        expect( profile ).not.toBeNull();
        expect( profile!.userName ).toBe( 'TestUser' );
    } );
} );
