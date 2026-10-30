import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AuthLevel, GetOidcIdentitiesQCommand, HttpCrisEndpoint, NgAuthService, NotificationService, UnlinkOidcIdentityCommand, UserOidcIdentity } from '@local/ck-gen';
import { DateTime } from 'luxon';

/**
 * An OpenID Connect identity of the user, ready to display.
 */
export type OidcIdentityView = {
    /** The suffix of the scheme ("Google" for "Oidc.Google"). */
    schemeSuffix: string,
    /** The provider's display name. */
    provider: string,
    /** The account at the provider: the "email" claim, else "preferred_username", else "name". */
    account: string,
    /** The last sign-in with this identity. */
    lastLogin: string,
    /** The claims shared by the provider at the last sign-in. */
    claims: Array<{ name: string, value: string }>
};

@Component( {
    selector: 'ck-oidc-identities',
    imports: [
        TranslateModule,
        NzButtonModule,
        NzListModule,
        NzPopconfirmModule
    ],
    templateUrl: './oidc-identities.html'
} )
export class OidcIdentities implements OnInit {
    // <PreDependencyInjection revert />
    readonly #auth = inject( NgAuthService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( NotificationService );
    readonly #translateService = inject( TranslateService );
    // <PostDependencyInjection />

    // <PreLocalVariables revert />
    readonly identities = signal<OidcIdentityView[]>( [] );
    readonly loading = signal( false );
    readonly busy = signal( false );
    // The identity whose claims are displayed.
    readonly expanded = signal<string | undefined>( undefined );
    /**
     * The OpenID Connect schemes of the authentication center that the user can link: the ones it has no identity for.
     */
    readonly linkable = computed( () => {
        const linked = new Set( this.identities().map( i => 'Oidc.' + i.schemeSuffix ) );
        return this.#auth.availableSchemes().map( s => s.name ).filter( s => s.startsWith( 'Oidc.' ) && !linked.has( s ) );
    } );
    protected readonly isImpersonated = this.#auth.isImpersonated;
    protected readonly isCritical = computed( () => this.#auth.level() === AuthLevel.Critical );
    protected readonly canReachCritical = this.#auth.canReachCritical;
    // <PostLocalVariables />

    async ngOnInit(): Promise<void> {
        if( this.#auth.availableSchemes().length === 0 ) await this.#auth.refreshSchemesAsync();
        await this.refreshAsync();
    }

    /** Reads the user's identities. */
    async refreshAsync(): Promise<void> {
        this.loading.set( true );
        try {
            const list = await this.#cris.sendOrThrowAsync( new GetOidcIdentitiesQCommand() );
            this.identities.set( ( list ?? [] ).map( i => this.#toView( i ) ) );
        }
        catch( error ) {
            this.#notif.notifyGenericCommunicationError();
        }
        finally {
            this.loading.set( false );
        }
    }

    /** The display name of a provider: the suffix of its scheme. */
    providerName( scheme: string ): string {
        return scheme.startsWith( 'Oidc.' ) ? scheme.substring( 5 ) : scheme;
    }

    /** The logo of a provider: the one of the login page (login-providers/<name>.png). */
    providerLogoSrc( provider: string ): string {
        return `login-providers/${provider.toLocaleLowerCase()}.png`;
    }

    toggleClaims( i: OidcIdentityView ): void {
        this.expanded.set( this.expanded() === i.schemeSuffix ? undefined : i.schemeSuffix );
    }

    // A login in a popup: the page keeps its state (the profile stays on this tab).
    async logInAgain(): Promise<void> {
        const auth = this.#auth.authService;
        if( !await this.#auth.elevateToCritical() && auth.remoteLoginError !== 'Authentication.PopupClosed' ) {
            this.#notif.notifySimpleMessage( 'error', this.#translateService.instant( auth.remoteLoginError ?? 'Login.RemoteLoginFailed' ) );
        }
    }

    async unlinkAsync( i: OidcIdentityView ): Promise<void> {
        // <PreUnlinkAsync revert />
        this.busy.set( true );
        try {
            const c = new UnlinkOidcIdentityCommand();
            c.schemeSuffix = i.schemeSuffix;
            const res = await this.#cris.sendOrThrowAsync( c );
            // The server's messages are in the caller's language: "unlinked", or why not (the last sign-in method).
            const message = res?.userMessages[0]?.message;
            if( res?.success ) {
                this.#notif.notifySimpleMessage( 'success', message ?? this.#translateService.instant( 'CK.UserProfile.Oidc.Unlinked' ) );
                await this.refreshAsync();
            }
            else {
                this.#notif.notifySimpleMessage( 'error', message ?? this.#translateService.instant( 'CK.UserProfile.Oidc.Failed' ) );
            }
        }
        catch( error ) {
            this.#notif.notifyGenericCommunicationError();
        }
        finally {
            this.busy.set( false );
        }
        // <PostUnlinkAsync />
    }

    /**
     * Links another provider: a remote login in a popup that binds the identity to the user (it must be called from a
     * click: the popup is opened first). The session is unchanged.
     */
    async linkAsync( scheme: string ): Promise<void> {
        // <PreLinkAsync revert />
        const auth = this.#auth.authService;
        if( await auth.startPopupBinding( scheme ) ) {
            this.#notif.notifySimpleMessage( 'success', this.#translateService.instant( 'CK.UserProfile.Oidc.Linked', { provider: this.providerName( scheme ) } ) );
            await this.refreshAsync();
        }
        else if( auth.remoteLoginError !== 'Authentication.PopupClosed' ) {
            this.#notif.notifySimpleMessage( 'error', this.#linkError( auth.remoteLoginError ) );
        }
        // <PostLinkAsync />
    }

    // A known refusal has its own message, any other one the generic message.
    #linkError( error: string | undefined ): string {
        const key = 'CK.UserProfile.Oidc.Error.' + error;
        const t = this.#translateService.instant( key );
        return t !== key ? t : this.#translateService.instant( 'CK.UserProfile.Oidc.LinkFailed' );
    }

    #toView( i: UserOidcIdentity ): OidcIdentityView {
        let claims: Record<string, unknown> = {};
        try {
            const parsed = JSON.parse( i.claims || '{}' );
            if( parsed && typeof parsed === 'object' ) claims = parsed;
        }
        catch {
            // Not a JSON object: nothing to display.
        }
        const text = ( v: unknown ) => typeof v === 'string' ? v : JSON.stringify( v );
        const account = [claims['email'], claims['preferred_username'], claims['name']].find( v => typeof v === 'string' && v.length > 0 ) as string | undefined;
        const lastLogin = i.lastLoginTime.year <= 1
                            ? this.#translateService.instant( 'CK.UserProfile.Oidc.Never' )
                            : i.lastLoginTime.setLocale( this.#translateService.currentLang ?? 'en' ).toLocaleString( DateTime.DATETIME_MED );
        return {
            schemeSuffix: i.schemeSuffix,
            provider: i.schemeSuffix || 'OpenID',
            account: account ?? '',
            lastLogin,
            claims: Object.keys( claims ).sort().map( name => ( { name, value: text( claims[name] ) } ) )
        };
    }
}
