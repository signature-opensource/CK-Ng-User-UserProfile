import { Component, signal } from '@angular/core';
import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import CKGenRoutes from '@local/ck-gen/CK/Angular/routes';
import { NgAuthService, AuthLevel, HttpCrisEndpoint, GetUserProfileQCommand, SetPasswordCommand, UserService, temporaryPasswordGuard } from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppComponent } from './app.component';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

describe( 'temporary password flow', () => {
    let ngAuthService: NgAuthService;
    let cris: HttpCrisEndpoint;

    beforeEach( async () => {
        await TestBed.configureTestingModule(
            {
                imports: [AppComponent],
                // CKGenAppModule provides no router: temporaryPasswordGuard needs one to build its UrlTree.
                providers: [...CKGenAppModule.Providers, provideRouter( [] ), { provide: ComponentFixtureAutoDetect, useValue: true }]
            } ).compileComponents();

        ngAuthService = TestBed.inject( NgAuthService );
        cris = TestBed.inject( HttpCrisEndpoint );
        await ngAuthService.authService.isInitialized;
        await cris.updateAmbientValuesAsync();
    } );

    afterEach( async () => {
        await ngAuthService.authService.logout();
    } );

    // A single authenticated session drives the whole flow: the state carried by the profile, and the
    // decision the guard takes from it. This describe must hold a single test: the AXIOS instance of
    // CKGenAppModule is created once at module load, so its authentication state is shared while
    // AuthService is rebuilt by each TestBed — a second login in this file logs in client-side but
    // sends anonymous Cris calls.
    it( 'carries IsTemporary down to the profile, and the guard acts on it', async () => {
        const authService = ngAuthService.authService;
        await authService.basicLogin( 'TestUser', 'success' );
        expect( ngAuthService.authenticationInfo().level ).toBe( AuthLevel.Normal );
        await cris.updateAmbientValuesAsync();

        const userId = authService.authenticationInfo.user.userId;
        const userService = TestBed.inject( UserService );

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
            // The guard reads the profile signal, not the database.
            await userService.refreshUserProfileAsync();
        };
        // The guard decides on the target URL, so the stub only needs to carry it.
        const runGuardAsync = ( url: string ) =>
            TestBed.runInInjectionContext( () => temporaryPasswordGuard(
                {} as ActivatedRouteSnapshot,
                { url } as RouterStateSnapshot ) ) as Promise<boolean | UrlTree>;

        // The property comes from CK.IO.User.UserPassword.Reset.IUserProfile, fed by the
        // sUserUserProfileRead transformer.
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( false );

        await setPasswordAsync( true );
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( true );
        expect( userService.userProfile()?.isTemporaryPassword ).toBe( true );

        // Every private page is now forbidden, starting with '/' — where a login lands. That one is
        // exactly what canActivateChild alone was missing: no child route matches '', so only the
        // canActivate of the private page can catch it.
        for ( const url of ['/', '/profile'] ) {
            const blocked = await runGuardAsync( url );
            expect( blocked ).toBeInstanceOf( UrlTree );
            expect( ( blocked as UrlTree ).toString() ).toBe( '/reset-password' );
        }
        // ...except the reset page itself, otherwise the redirection would loop. Query parameters
        // must not defeat that exemption either.
        expect( await runGuardAsync( '/reset-password' ) ).toBe( true );
        expect( await runGuardAsync( '/reset-password?from=login' ) ).toBe( true );

        // isTemporary defaults to false: this is what the reset form sends once the user
        // has chosen a real password. Navigation is free again.
        await setPasswordAsync();
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( false );
        expect( await runGuardAsync( '/' ) ).toBe( true );
        expect( await runGuardAsync( '/profile' ) ).toBe( true );
    } );
} );

// Deliberately outside the describe above: no TestBed, no session, so no logout can interfere with
// it. The generated routes and the guard are plain module exports.
describe( 'temporary password guard registration', () => {
    it( 'is registered as the canActivate of the private page, re-run on every navigation', () => {
        // The private page is the "" route: this is what AppRoutes.t targets. Asserting it here is
        // what proves the transformer has been applied to the generated routes.
        const privatePage = CKGenRoutes.find( r => r.path === '' );
        expect( privatePage ).toBeDefined();
        // Both properties are load-bearing: removing either one makes a router-driven test below
        // fail. canActivateChild is deliberately absent, 'always' already covers the children.
        expect( privatePage!.canActivate ).toContain( temporaryPasswordGuard );
        expect( privatePage!.runGuardsAndResolvers ).toBe( 'always' );
        // CK.Ng.AspNet.Auth's own guard must still be there: the two transformers coexist.
        expect( privatePage!.canMatch?.length ).toBe( 1 );
    } );
} );

// Drives the real router over the generated route registration. The tests above call the guard
// function directly, which cannot tell "registered" from "actually invoked by the router" — and that
// is precisely what was missing twice: canActivateChild is not run for '' (no child route matches
// it), and canActivate is not re-run when the private page is retained.
describe( 'temporary password guard, driven by the router', () => {
    @Component( { template: '' } )
    class Dummy { }

    let router: Router;

    beforeEach( () => {
        const privatePage = CKGenRoutes.find( r => r.path === '' )!;
        TestBed.configureTestingModule( {
            providers: [
                provideRouter( [ {
                    path: '',
                    component: Dummy,
                    // Taken verbatim from the generated routes: this is the registration under test.
                    // canMatch is left out, it depends on an authenticated AuthService.
                    runGuardsAndResolvers: privatePage.runGuardsAndResolvers,
                    canActivate: privatePage.canActivate,
                    children: [
                        { path: 'profile', component: Dummy },
                        { path: 'reset-password', component: Dummy }
                    ]
                } ] ),
                // The guard only reads these two signals off the UserService.
                {
                    provide: UserService,
                    useValue: { profileLoaded: signal( true ), userProfile: signal( { isTemporaryPassword: true } ) }
                }
            ]
        } );
        router = TestBed.inject( Router );
    } );

    it( 'redirects a navigation to a child page', async () => {
        await RouterTestingHarness.create( '/profile' );
        expect( router.url ).toBe( '/reset-password' );
    } );

    it( 'redirects a landing on the private page itself, where a login goes', async () => {
        await RouterTestingHarness.create( '/' );
        expect( router.url ).toBe( '/reset-password' );
    } );

    it( 'redirects a navigation back to the private page from inside it (the logo "go to home")', async () => {
        const harness = await RouterTestingHarness.create( '/reset-password' );
        expect( router.url ).toBe( '/reset-password' );
        // goToHome() of the sample's private-page.t does exactly this navigate( [''] ). The parent is
        // retained here, so only runGuardsAndResolvers: 'always' makes the guard run again.
        await harness.navigateByUrl( '/' );
        expect( router.url ).toBe( '/reset-password' );
    } );

    it( 'lets every page through once the password is no longer temporary', async () => {
        TestBed.inject( UserService ).userProfile.set( { isTemporaryPassword: false } );
        const harness = await RouterTestingHarness.create( '/profile' );
        expect( router.url ).toBe( '/profile' );
        await harness.navigateByUrl( '/' );
        expect( router.url ).toBe( '/' );
    } );
} );
