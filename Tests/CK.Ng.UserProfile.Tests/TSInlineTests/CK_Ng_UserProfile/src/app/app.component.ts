// <HasNgPrivatePage />
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CKGenAppModule } from '@local/ck-gen/CK/Angular/CKGenAppModule';

import { PrivatePage, NgAuthService, UserService, AuthLevel } from '@local/ck-gen';
// Private Page is from CK.Ng.Cris.AspNet.Authentication package.
@Component( {
  selector: 'app-root',
  imports: [RouterOutlet, PrivatePage, CKGenAppModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.less'
} )
export class AppComponent {

  readonly #authService = inject( NgAuthService );
  readonly #userService = inject( UserService );
  isAuthenticated = computed( () => this.#authService.actor().actorId !== 0 );

  title = 'CK_Ng_UserProfile';

  constructor() {
    this.#authService.authService.addOnChange( async ( a ) => {
      if ( a.level >= AuthLevel.Normal ) {
        await this.#userService.refreshUserProfileAsync();
      }
    } )
  }
}
