import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, GetUserProfileQCommand, SetPasswordCommand } from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

describe( 'temporary password flow', () => {
    let ngAuthService: NgAuthService;
    let cris: HttpCrisEndpoint;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                imports: [AppComponent],
                providers: [...CKGenAppModule.Providers, { provide: ComponentFixtureAutoDetect, useValue: true }]
            } ).compileComponents();

        ngAuthService = TestBed.inject( NgAuthService );
        cris = TestBed.inject( HttpCrisEndpoint );
        await ngAuthService.authService.isInitialized;
        await cris.updateAmbientValuesAsync();
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
    } );

    it( 'carries IsTemporary from the command down to the user profile', async () => {
        const authService = ngAuthService.authService;
        await authService.basicLogin( 'TestUser', 'success' );
        expect( ngAuthService.authenticationInfo().level ).toBe( AuthLevel.Normal );
        await cris.updateAmbientValuesAsync();

        const userId = authService.authenticationInfo.user.userId;

        const readProfileAsync = async () => {
            const p = await cris.sendOrThrowAsync( new GetUserProfileQCommand( userId ) );
            expect( p ).not.toBeNull();
            return p!;
        };
        // ActorId is set explicitly, as the production forms of this repo do
        // (see user-update-form.t in NamedUser / PreferredCulture).
        const setPasswordAsync = async ( isTemporary?: boolean ) => {
            const cmd = new SetPasswordCommand( userId, 'success' );
            cmd.actorId = userId;
            if ( isTemporary !== undefined ) cmd.isTemporary = isTemporary;
            const res = await cris.sendOrThrowAsync( cmd );
            expect( res?.success ).toBe( true );
        };

        // The property comes from CK.IO.User.UserPassword.Reset.IUserProfile, fed by the
        // sUserUserProfileRead transformer.
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( false );

        await setPasswordAsync( true );
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( true );

        // isTemporary defaults to false: this is what the reset form sends once the user
        // has chosen a real password.
        await setPasswordAsync();
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( false );
    } );
} );
