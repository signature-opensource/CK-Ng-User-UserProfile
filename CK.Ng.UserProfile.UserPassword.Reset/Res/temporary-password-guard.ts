import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { UserService } from '@local/ck-gen';

/**
 * Route of the reset page. Must stay in sync with the
 * `[NgRoutedComponent<INgPrivatePageComponent>( Route = "reset-password" )]` of
 * ResetPasswordFormComponent.
 */
const RESET_PASSWORD_ROUTE = 'reset-password';

/**
 * Forbids every private page to an authenticated user whose password is a temporary one: it is
 * redirected to the reset page until it has chosen a real password.
 *
 * Registered by AppRoutes.t as the `canActivate` of the private page, which also carries
 * `runGuardsAndResolvers: 'always'` so that it runs on every navigation of the subtree — including
 * a landing on the private page itself (a login navigates to '', which matches no child route) and a
 * navigation back to it from inside (a "go to home"), where the route is merely retained.
 */
export const temporaryPasswordGuard: CanActivateFn = async ( _route: ActivatedRouteSnapshot,
                                                            state: RouterStateSnapshot ) => {
  // The injections (and the toObservable below) must happen before the first await: the injection
  // context is lost afterwards.
  const userService = inject( UserService );
  const router = inject( Router );

  // The reset page itself must be reachable, otherwise the redirection would loop. Tested on the
  // target URL and not on the route config: as the canActivate of the private page this guard
  // receives the parent snapshot, whose path is '' whatever the actual destination.
  if ( state.url.split( '?' )[0] === `/${RESET_PASSWORD_ROUTE}` ) return true;

  // On a hard load (F5, typed URL) the profile is still in flight: wait for it rather than letting
  // the navigation through. profileLoaded settles even when the read failed, in which case the
  // profile stays undefined and the navigation is allowed: a network incident must not lock the
  // user out of the application.
  if ( !userService.profileLoaded() ) {
    await firstValueFrom( toObservable( userService.profileLoaded ).pipe( filter( loaded => loaded ) ) );
  }

  return userService.userProfile()?.isTemporaryPassword
            ? router.parseUrl( `/${RESET_PASSWORD_ROUTE}` )
            : true;
};
