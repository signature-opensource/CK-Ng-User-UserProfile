import { Component, signal } from '@angular/core';
import CKGenRoutes from '@local/ck-gen/CK/Angular/routes';
import { bannedGuard, BannedSession, UserService } from '@local/ck-gen';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';

if ( process.env["VSCODE_INSPECTOR_OPTIONS"] ) jest.setTimeout( 30 * 60 * 1000 ); // 30 minutes

// No TestBed and no session here: the generated routes and the guard are plain module exports.
// Asserting on them is what proves AppRoutes.t has been applied to the generated routes.
describe( 'banned flow, route registration', () => {

    it( 'registers bannedGuard as a canActivate of the private page, re-run on every navigation', () => {
        // The private page is the "" route: this is what AppRoutes.t targets.
        const privatePage = CKGenRoutes.find( r => r.path === '' );
        expect( privatePage ).toBeDefined();
        // toContain, not toEqual: the array is owned by CK.Ng.UserProfile and any package may append
        // its own guard into it, so this must not assert on what else is in there.
        expect( privatePage!.canActivate ).toContain( bannedGuard );
        // Emitted by CK.Ng.UserProfile, not by this package - and load-bearing: without it the guard
        // would not re-run on a navigation back to "" from inside the private area.
        expect( privatePage!.runGuardsAndResolvers ).toBe( 'always' );
        // The transformer must not have clobbered CK.Ng.AspNet.Auth's own guard.
        expect( privatePage!.canMatch?.length ).toBe( 1 );
    } );

    it( 'leaves the guard off every other route', () => {
        // The guard belongs to the private page only. A banished user must still reach the
        // authentication page - that is where logging out sends it.
        const others = CKGenRoutes.filter( r => r.path !== '' );
        expect( others.length ).toBeGreaterThan( 0 );
        for ( const r of others ) {
            expect( r.canActivate ?? [] ).not.toContain( bannedGuard );
        }
    } );
} );

// Drives the real router over the generated registration. The tests above cannot tell "registered"
// from "actually invoked by the router", which is exactly what runGuardsAndResolvers is about.
describe( 'bannedGuard, driven by the router', () => {

    @Component( { template: '<router-outlet />', imports: [RouterOutlet] } )
    class Dummy { }

    let router: Router;
    let logoutBannedAsync: jest.Mock;

    const configure = ( isBanned: boolean ) => {
        const privatePage = CKGenRoutes.find( r => r.path === '' )!;
        logoutBannedAsync = jest.fn().mockResolvedValue( undefined );
        TestBed.configureTestingModule( {
            providers: [
                provideRouter( [
                    // A sibling of the private page: this is where the logout navigates, outside the
                    // guarded subtree, so nothing can loop.
                    { path: 'auth', component: Dummy },
                    {
                        path: '',
                        component: Dummy,
                        // Taken verbatim from the generated routes: this is the registration under
                        // test. canMatch is left out, it needs an authenticated AuthService.
                        runGuardsAndResolvers: privatePage.runGuardsAndResolvers,
                        canActivate: privatePage.canActivate,
                        children: [{ path: 'profile', component: Dummy }]
                    }
                ] ),
                // The guard reads exactly these two signals off the UserService...
                {
                    provide: UserService,
                    useValue: { profileLoaded: signal( true ), userProfile: signal( { isBanned } ) }
                },
                // ...and calls exactly this on the session.
                { provide: BannedSession, useValue: { logoutBannedAsync } }
            ]
        } );
        router = TestBed.inject( Router );
    };

    afterEach( () => TestBed.resetTestingModule() );

    it( 'blocks a banished user and logs it out', async () => {
        configure( true );
        await expect( router.navigateByUrl( '/profile' ) ).resolves.toBe( false );
        expect( logoutBannedAsync ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'blocks a landing on the private page itself, where a login goes', async () => {
        configure( true );
        await expect( router.navigateByUrl( '/' ) ).resolves.toBe( false );
        expect( logoutBannedAsync ).toHaveBeenCalledTimes( 1 );
    } );

    it( 'lets a user that is not banished through, and logs nobody out', async () => {
        configure( false );
        await expect( router.navigateByUrl( '/profile' ) ).resolves.toBe( true );
        expect( logoutBannedAsync ).not.toHaveBeenCalled();
    } );
} );
