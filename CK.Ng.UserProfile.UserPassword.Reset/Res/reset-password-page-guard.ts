import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { NgAuthService, UserService } from '@local/ck-gen';

/**
 * Url of the reset page. Must stay in sync with the
 * `[NgRoutedComponent<AuthenticationPageComponent>( Route = "reset-password" )]` of
 * ResetPasswordFormComponent: "auth" is the route of the authentication page it is a child of.
 */
export const RESET_PASSWORD_URL = '/auth/reset-password';

/**
 * Guards the reset page itself, registered by AuthRoutes.t as its `canActivate`.
 *
 * The page used to be a child of the private page, whose `canMatch` kept anonymous visitors out of
 * it for free. Under the authentication page nothing does, hence this guard — which also sends
 * back to the application a user who no longer has anything to do here.
 */
export const resetPasswordPageGuard: CanActivateFn = async ( _route: ActivatedRouteSnapshot,
                                                             _state: RouterStateSnapshot ) => {
  // The injections (and the toObservable below) must happen before the first await: the injection
  // context is lost afterwards.
  const authService = inject( NgAuthService );
  const userService = inject( UserService );
  const router = inject( Router );
  const profileLoaded = toObservable( userService.profileLoaded );

  // Tested first, and never awaited on: UserService resets profileLoaded to false as soon as the
  // authentication level drops, so awaiting it while anonymous would never settle. Same predicate
  // as the canMatch of the private page.
  if ( authService.authenticationInfo().user.userId <= 0 ) return router.parseUrl( '/auth' );

  // On a hard load (F5, typed url) the profile is still in flight: wait for it.
  if ( !userService.profileLoaded() ) {
    await firstValueFrom( profileLoaded.pipe( filter( loaded => loaded ) ) );
  }

  // Also covers a failed profile read, which leaves the profile undefined: the user is sent to the
  // application rather than held on a page it may have no reason to see. temporaryPasswordGuard
  // lets it through on the very same grounds — a network incident must not lock anyone out.
  return userService.userProfile()?.isTemporaryPassword ? true : router.parseUrl( '/' );
};
