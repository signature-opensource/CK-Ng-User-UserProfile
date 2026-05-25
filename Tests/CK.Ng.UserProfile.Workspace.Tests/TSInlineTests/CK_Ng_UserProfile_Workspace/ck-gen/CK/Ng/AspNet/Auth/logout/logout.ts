import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';
import { AuthService } from '@local/ck-gen/CK/AspNet/Auth/AuthService';

@Component( {
  selector: 'ck-logout',
  imports: [NzButtonModule, NzResultModule, TranslateModule],
  templateUrl: './logout.html'
} )
export class Logout {
  // <PreDependencyInjection revert />
  readonly #authService = inject( AuthService );
  readonly #router = inject( Router );
  // <PostDependencyInjection />

  // <PreLocalVariables revert />
  // <PostLocalVariables />

  async ngOnInit(): Promise<void> {
    // <PreLogout revert />
    await this.#authService.logout();
    // <PostLogout />
  }

  return(): void {
    // <PreNavigation revert />
    this.#router.navigate( ['auth'] );
    // <PostRedirection />
  }
}
