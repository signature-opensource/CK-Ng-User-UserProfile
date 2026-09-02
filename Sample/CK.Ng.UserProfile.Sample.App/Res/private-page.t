create <html> transformer
begin
    insert before * """
                    <ck-backoffice-layout
                        [showGlobalSearchBtn]="true"
                        [globalSearchPlaceholder]="'Search.Placeholder' | translate"
                        [displayWCSDropdown]="false"
                        (logoClicked)="goToHome()">
                        <!-- <h1>This is a sample for CK.Ng.UserProfile package.</h1> -->

                        <!-- LOCAL TEST ONLY, to be removed: bans the signed-in user for two minutes so
                             the banishment flow (server push -> BannedSession -> logout) can be tried
                             without a second browser and a second administrator. -->
                        <button type="button"
                                style="position:fixed;right:1rem;bottom:1rem;z-index:1000;padding:.5rem .75rem;border:1px solid #cf1322;border-radius:4px;background:#fff1f0;color:#cf1322;cursor:pointer"
                                [disabled]="selfBanPending()"
                                (click)="selfBanForTestAsync()">
                            {{ selfBanPending() ? 'Banning...' : 'Ban me (2 min)' }}
                        </button>

                    """;

    insert """
           </ck-backoffice-layout>

           """ after *;
end

create <ts> transformer
begin
    ensure import { inject, signal } from '@angular/core';
    ensure import { Layout } from '@local/ck-gen';
    ensure import { HttpCrisEndpoint } from '@local/ck-gen';
    ensure import { NgAuthService } from '@local/ck-gen';
    ensure import { SetUserBannedCommand } from '@local/ck-gen';
    ensure import { DateTime } from 'luxon';
    ensure import { TranslateModule } from '@ngx-translate/core';
    ensure import { Router } from '@angular/router';

    in after "@Component" 
        in first {^braces}
            in after "imports:"
                in first {^[]}
                    replace "RouterOutlet" with "RouterOutlet, Layout, TranslateModule";

    inject """
           readonly #router = inject( Router );
           readonly #crisEndpoint = inject( HttpCrisEndpoint );
           readonly #authService = inject( NgAuthService );

           """ into <PreDependencyInjection>;

    inject """
           goToHome(): void {
             this.#router.navigate( [''] );
           }

           // LOCAL TEST ONLY, to be removed with the button in the template above.
           readonly selfBanPending = signal( false );

           /**
            * Bans the signed-in user, then does nothing: the ejection is precisely what is under test.
            * The server pushes `banned` on the actor channel, BannedSession logs out and navigates to
            * /auth. If the push never arrives, the next command is refused by BannedActorValidator and
            * the rejected channel registration takes over - both paths end the same way.
            *
            * The ban lasts two minutes on purpose. An eternal one (what the command does when
            * banEndDate is left undefined) would lock the tester out of its own sample for good,
            * unless another administrator is around to lift it.
            */
           async selfBanForTestAsync(): Promise<void> {
             const userId = this.#authService.authenticationInfo().user.userId;
             if ( userId === 0 || this.selfBanPending() ) return;
             this.selfBanPending.set( true );
             try {
               const cmd = new SetUserBannedCommand();
               cmd.userId = userId;
               // No % and no _: CK.sUserBannedSet matches the reason with LIKE.
               cmd.keyReason = 'SelfBanTest';
               // banStartDate left undefined: sysutcdatetime() on creation, existing start date kept
               // on update - so clicking twice extends the window instead of restarting it.
               cmd.banEndDate = DateTime.utc().plus( { minutes: 2 } );
               await this.#crisEndpoint.sendOrThrowAsync( cmd );
             } finally {
               this.selfBanPending.set( false );
             }
           }
           """ into <PostLocalVariables>;
end
