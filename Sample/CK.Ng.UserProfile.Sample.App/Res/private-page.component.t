create <html> transformer
begin
    insert before * """
                    <ck-backoffice-layout
                        [showGlobalSearchBtn]="true"
                        [globalSearchPlaceholder]="'Search.Placeholder' | translate"
                        [displayWCSDropdown]="false"
                        (logoClicked)="goToHome()">
                        <!-- <h1>This is a sample for CK.Ng.UserProfile package.</h1> -->

                    """;

    insert """
           </ck-backoffice-layout>

           <ng-template #defaultListTpl>
               <!-- Default displayed items when modal opens -->
               <div class="default-list">
               </div>
           </ng-template>

           <ng-template #resultTpl>
               <!-- Search result items -->
               <div class="search-result">
               </div>
           </ng-template>
           """ after *;
end

create <ts> transformer
begin
    ensure import { inject } from '@angular/core';
    ensure import { LayoutComponent } from '@local/ck-gen';
    ensure import { TranslateModule } from '@ngx-translate/core';
    ensure import { Router } from '@angular/router';

    in after "@Component" 
        in first {^braces}
            in after "imports:"
                in first {^[]}
                    replace "RouterOutlet" with "RouterOutlet, LayoutComponent, TranslateModule";

    inject """
           readonly #router = inject( Router );

           """ into <PreDependencyInjection>;

    inject """
           goToHome(): void {
             this.#router.navigate( [''] );
           }
           """ into <PostLocalVariables>;
end
