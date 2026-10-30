import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthLevel,
  NgAuthService,
  NotificationService
} from '@local/ck-gen';

/**
 * Owns the single logout path of the banishment flow: the navigation guard (bannedGuard) reads `isBanned` on the
 * loaded profile and calls it.
 *
 * This is not the security mechanism: a banished user is stopped by the server refusing its commands and the refresh
 * of its session (the authentication center). What lives here only makes the ejection legible.
 */
@Injectable( { providedIn: 'root' } )
export class BannedSession {
  readonly #authService = inject( NgAuthService );
  readonly #notifService = inject( NotificationService );
  readonly #router = inject( Router );
  readonly #translateService = inject( TranslateService );

  // Held while a logout is in flight: concurrent navigations may detect the banishment together and only the first
  // one may act.
  #loggingOut = false;

  /**
   * Logs the user out and sends it back to the authentication page. Idempotent: whichever detection gets there first
   * wins, the others become no-ops.
   *
   * The flag is released at the end rather than kept forever: this service is a root singleton, so it outlives the
   * session, and another user may well log in in the same page afterwards. Testing the authentication level is what
   * makes a late detection harmless in the meantime.
   */
  async logoutBannedAsync(): Promise<void> {
    if ( this.#loggingOut ) return;
    if ( this.#authService.level() < AuthLevel.Normal ) return;
    this.#loggingOut = true;
    try {
      this.#notifService.notifySimpleMessage( 'error', this.#translateService.instant( 'CK.Auth.Banned.Message' ) );
      await this.#authService.authService.logout();
      await this.#router.navigateByUrl( '/auth' );
    } finally {
      this.#loggingOut = false;
    }
  }
}
