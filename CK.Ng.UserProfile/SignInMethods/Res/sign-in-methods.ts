import { Component, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzListModule } from 'ng-zorro-antd/list';
import { NgAuthService } from '@local/ck-gen';
import { DateTime } from 'luxon';

/**
 * A sign-in method of the user: its scheme ("Basic", "Passkey", "Oidc.Google"...) and its last use.
 */
export type SignInMethod = { scheme: string, name: string, lastUsed: string };

@Component( {
    selector: 'ck-sign-in-methods',
    imports: [
        TranslateModule,
        NzListModule
    ],
    templateUrl: './sign-in-methods.html'
} )
export class SignInMethods {
    // <PreDependencyInjection revert />
    readonly #authService = inject( NgAuthService );
    readonly #translateService = inject( TranslateService );
    // <PostDependencyInjection />

    // <PreLocalVariables revert />
    /**
     * The sign-in methods of the user, the last used first: the schemes of its authentication, known by the browser.
     * They are the ones of the last sign-in or refresh of the session: a section that adds or removes a method shows its
     * own, up to date, state.
     */
    readonly methods = computed<SignInMethod[]>( () => {
        const schemes = this.#authService.authenticationInfo().unsafeActor.schemes;
        return [...schemes]
            .sort( ( a, b ) => b.lastUsed.toMillis() - a.lastUsed.toMillis() )
            .map( s => ( { scheme: s.scheme, name: this.schemeName( s.scheme ), lastUsed: this.#formatLastUsed( s.lastUsed ) } ) );
    } );
    // <PostLocalVariables />

    /**
     * Gets the display name of a scheme: "CK.UserProfile.SignInMethods.Scheme.<scheme>" when it is translated, the
     * suffix of a remote scheme ("Google" for "Oidc.Google") or the scheme itself otherwise.
     * @param scheme The scheme.
     * @returns The display name.
     */
    schemeName( scheme: string ): string {
        const key = 'CK.UserProfile.SignInMethods.Scheme.' + scheme;
        const t = this.#translateService.instant( key );
        if( t !== key ) return t;
        const dot = scheme.indexOf( '.' );
        return dot > 0 ? scheme.substring( dot + 1 ) : scheme;
    }

    #formatLastUsed( lastUsed: DateTime ): string {
        // The min value: never used (a method added after the last sign-in, for instance).
        return lastUsed.year <= 1
                ? this.#translateService.instant( 'CK.UserProfile.SignInMethods.NeverUsed' )
                : lastUsed.setLocale( this.#translateService.currentLang ?? 'en' ).toLocaleString( DateTime.DATETIME_MED );
    }
}
