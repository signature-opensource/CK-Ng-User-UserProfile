import { Component, signal } from '@angular/core';
import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';
import CKGenRoutes from '@local/ck-gen/CK/Angular/routes';
import {
    NgAuthService,
    AuthLevel,
    HttpCrisEndpoint,
    GetUserProfileQCommand,
    SetPasswordCommand,
    UserService,
    temporaryPasswordGuard,
    resetPasswordPageGuard
} from '@local/ck-gen';
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    provideRouter,
    Router,
    RouterOutlet,
    RouterStateSnapshot,
    UrlTree
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AppComponent } from './app.component';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// The url temporaryPasswordGuard redirects to. The "back" button of the authentication page is
// hidden by reset-password-form.less, not by a query parameter: see the comment there.
const RESET_PAGE = '/auth/reset-password';

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
        //
        // No url is exempted any more: the reset page left the private page for the authentication
        // page, so this guard is never asked about it. That the router agrees is asserted below, in
        // 'temporary password guard, driven by the router'.
        for ( const url of ['/', '/profile'] ) {
            const blocked = await runGuardAsync( url );
            expect( blocked ).toBeInstanceOf( UrlTree );
            expect( ( blocked as UrlTree ).toString() ).toBe( RESET_PAGE );
        }

        // isTemporary defaults to false: this is what the reset form sends once the user
        // has chosen a real password. Navigation is free again.
        await setPasswordAsync();
        expect( ( await readProfileAsync() ).isTemporaryPassword ).toBe( false );
        expect( await runGuardAsync( '/' ) ).toBe( true );
        expect( await runGuardAsync( '/profile' ) ).toBe( true );
    } );
} );

// Deliberately outside the describe above: no TestBed, no session, so no logout can interfere with
// it. The generated routes and the guards are plain module exports.
describe( 'temporary password flow, route registration', () => {
    it( 'registers temporaryPasswordGuard as the canActivate of the private page, re-run on every navigation', () => {
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

    it( 'registers the reset page under the authentication page, guarded by resetPasswordPageGuard', () => {
        // Produced by [NgRoutedComponent<AuthenticationPageComponent>] — the page is a sibling of
        // password-lost and recover-password, not a child of the private page any more.
        const authPage = CKGenRoutes.find( r => r.path === 'auth' );
        expect( authPage ).toBeDefined();
        const resetPage = authPage!.children?.find( c => c.path === 'reset-password' );
        expect( resetPage ).toBeDefined();
        // Lazy, like its two siblings.
        expect( resetPage!.loadComponent ).toBeDefined();
        // And this is what proves AuthRoutes.t has been applied.
        expect( resetPage!.canActivate ).toContain( resetPasswordPageGuard );

        // The counterpart: it must have left the private page, otherwise it would still be reachable
        // through the application shell.
        const privateChildren = CKGenRoutes.find( r => r.path === '' )!.children;
        expect( privateChildren?.some( c => c.path === 'reset-password' ) ).toBe( false );
    } );
} );

// Drives the real router over the generated route registration. The tests above call the guard
// function directly, which cannot tell "registered" from "actually invoked by the router" — and that
// is precisely what was missing twice: canActivateChild is not run for '' (no child route matches
// it), and canActivate is not re-run when the private page is retained.
describe( 'temporary password guard, driven by the router', () => {
    // Carries a router-outlet: Dummy stands for a leaf page and for a parent layout alike.
    @Component( { template: '<router-outlet />', imports: [RouterOutlet] } )
    class Dummy { }

    let router: Router;

    beforeEach( () => {
        const privatePage = CKGenRoutes.find( r => r.path === '' )!;
        TestBed.configureTestingModule( {
            providers: [
                provideRouter( [
                    // The authentication page and its reset child, stubbed. What matters here is that
                    // they are a SIBLING of the private page, so the redirection below lands outside
                    // the guarded subtree and cannot loop.
                    { path: 'auth', component: Dummy, children: [{ path: 'reset-password', component: Dummy }] },
                    {
                        path: '',
                        component: Dummy,
                        // Taken verbatim from the generated routes: this is the registration under test.
                        // canMatch is left out, it depends on an authenticated AuthService.
                        runGuardsAndResolvers: privatePage.runGuardsAndResolvers,
                        canActivate: privatePage.canActivate,
                        children: [{ path: 'profile', component: Dummy }]
                    }
                ] ),
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
        expect( router.url ).toBe( RESET_PAGE );
    } );

    it( 'redirects a landing on the private page itself, where a login goes', async () => {
        await RouterTestingHarness.create( '/' );
        expect( router.url ).toBe( RESET_PAGE );
    } );

    it( 'never sees the reset page, which is why no exemption is needed any more', async () => {
        // The whole reason the guard could drop its self-exemption: 'auth' is a sibling route, so the
        // canActivate of the private page is never consulted for it.
        await RouterTestingHarness.create( '/auth/reset-password' );
        expect( router.url ).toBe( '/auth/reset-password' );
    } );

    it( 'redirects a navigation back to the private page from inside it (the logo "go to home")', async () => {
        const harness = await RouterTestingHarness.create( '/auth/reset-password' );
        // goToHome() of the sample's private-page.t does exactly this navigate( [''] ). The parent is
        // retained here, so only runGuardsAndResolvers: 'always' makes the guard run again.
        await harness.navigateByUrl( '/' );
        expect( router.url ).toBe( RESET_PAGE );
    } );

    it( 'lets every page through once the password is no longer temporary', async () => {
        TestBed.inject( UserService ).userProfile.set( { isTemporaryPassword: false } );
        const harness = await RouterTestingHarness.create( '/profile' );
        expect( router.url ).toBe( '/profile' );
        await harness.navigateByUrl( '/' );
        expect( router.url ).toBe( '/' );
    } );
} );


// The guard of the reset page itself. Under the authentication page the page lost the canMatch of
// the private page, which used to keep anonymous visitors out of it for free.
describe( 'reset page guard', () => {
    const configure = ( userId: number, profile?: { isTemporaryPassword: boolean } ) => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule( {
            providers: [
                // The guard needs a router to build its UrlTree, nothing more: it never navigates.
                provideRouter( [] ),
                {
                    provide: NgAuthService,
                    useValue: { authenticationInfo: signal( { user: { userId } } ) }
                },
                {
                    // profileLoaded mirrors UserService: it is false while anonymous, which is why the
                    // guard must test the authentication BEFORE awaiting it.
                    provide: UserService,
                    useValue: { profileLoaded: signal( userId > 0 ), userProfile: signal( profile ) }
                }
            ]
        } );
    };

    const runGuardAsync = ( url: string ) =>
        TestBed.runInInjectionContext( () => resetPasswordPageGuard(
            {} as ActivatedRouteSnapshot,
            { url } as RouterStateSnapshot ) ) as Promise<boolean | UrlTree>;

    it( 'sends an anonymous visitor to the login page', async () => {
        // Awaiting profileLoaded here would never settle: UserService resets it to false as soon as
        // the authentication level drops. This test is what pins that ordering.
        configure( 0 );
        const blocked = await runGuardAsync( RESET_PAGE );
        expect( blocked ).toBeInstanceOf( UrlTree );
        expect( ( blocked as UrlTree ).toString() ).toBe( '/auth' );
    } );

    it( 'sends back to the application a user whose password is no longer temporary', async () => {
        configure( 42, { isTemporaryPassword: false } );
        const blocked = await runGuardAsync( RESET_PAGE );
        expect( blocked ).toBeInstanceOf( UrlTree );
        expect( ( blocked as UrlTree ).toString() ).toBe( '/' );
    } );

    it( 'sends back to the application when the profile could not be read', async () => {
        // profileLoaded settles even on failure, leaving the profile undefined. A network incident
        // must not hold anyone on this page, exactly as it must not lock anyone out of the private
        // pages — see temporaryPasswordGuard.
        configure( 42, undefined );
        const blocked = await runGuardAsync( RESET_PAGE );
        expect( blocked ).toBeInstanceOf( UrlTree );
        expect( ( blocked as UrlTree ).toString() ).toBe( '/' );
    } );

    it( 'lets the page through for a temporary password', async () => {
        configure( 42, { isTemporaryPassword: true } );
        expect( await runGuardAsync( RESET_PAGE ) ).toBe( true );
    } );
} );
