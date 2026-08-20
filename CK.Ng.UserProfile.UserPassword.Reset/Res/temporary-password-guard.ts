import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { UserService } from '@local/ck-gen';
import { RESET_PASSWORD_URL } from './reset-password-page-guard';

/**
 * Forbids every private page to an authenticated user whose password is a temporary one: it is
 * redirected to the reset page until it has chosen a real password.
 *
 * Registered by AppRoutes.t as the `canActivate` of the private page, which also carries
 * `runGuardsAndResolvers: 'always'` so that it runs on every navigation of the subtree — including
 * a landing on the private page itself (a login navigates to '', which matches no child route) and a
 * navigation back to it from inside (a "go to home"), where the route is merely retained.
 *
 * No exemption for the reset page is needed: it lives under the authentication page, a sibling of
 * the private page, so this guard never sees it. `resetPasswordPageGuard` guards it instead.
 */
export const temporaryPasswordGuard: CanActivateFn = async ( _route: ActivatedRouteSnapshot,
                                                             _state: RouterStateSnapshot ) => {
  // The injections (and the toObservable below) must happen before the first await: the injection
  // context is lost afterwards.
  const userService = inject( UserService );
  const router = inject( Router );

  // On a hard load (F5, typed URL) the profile is still in flight: wait for it rather than letting
  // the navigation through. profileLoaded settles even when the read failed, in which case the
  // profile stays undefined and the navigation is allowed: a network incident must not lock the
  // user out of the application.
  if ( !userService.profileLoaded() ) {
    await firstValueFrom( toObservable( userService.profileLoaded ).pipe( filter( loaded => loaded ) ) );
  }

  return userService.userProfile()?.isTemporaryPassword
            ? router.parseUrl( RESET_PASSWORD_URL )
            : true;
};
