import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AuthLevel, DeletePasskeyCommand, GetPasskeysQCommand, HttpCrisEndpoint, NgAuthService, NotificationService, PasskeyRegistrationButton, RenamePasskeyCommand, UserPasskey } from '@local/ck-gen';
import { DateTime } from 'luxon';

@Component( {
    selector: 'ck-passkey-list',
    imports: [
        FormsModule,
        TranslateModule,
        NzButtonModule,
        NzInputModule,
        NzListModule,
        NzPopconfirmModule,
        PasskeyRegistrationButton
    ],
    templateUrl: './passkey-list.html'
} )
export class PasskeyList implements OnInit {
    // <PreDependencyInjection revert />
    readonly #auth = inject( NgAuthService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( NotificationService );
    readonly #translateService = inject( TranslateService );
    // <PostDependencyInjection />

    // <PreLocalVariables revert />
    /** The maximal length of a passkey name (the server's rule). */
    static readonly maxNameLength = 128;
    readonly passkeys = signal<UserPasskey[]>( [] );
    readonly loading = signal( false );
    // The passkey being renamed and its new name.
    readonly editingId = signal<number | undefined>( undefined );
    editedName = '';
    // The name of the next passkey (optional: the server names it "Passkey" otherwise).
    newName = '';
    protected readonly isImpersonated = this.#auth.isImpersonated;
    protected readonly isCritical = computed( () => this.#auth.level() === AuthLevel.Critical );
    protected readonly canReachCritical = this.#auth.canReachCritical;
    // <PostLocalVariables />

    async ngOnInit(): Promise<void> {
        await this.refreshAsync();
    }

    /** Reads the user's passkeys. */
    async refreshAsync(): Promise<void> {
        this.loading.set( true );
        try {
            const list = await this.#cris.sendOrThrowAsync( new GetPasskeysQCommand() );
            this.passkeys.set( list ?? [] );
        }
        catch( error ) {
            this.#notif.notifyGenericCommunicationError();
        }
        finally {
            this.loading.set( false );
        }
    }

    /** Displays a date: "never" for the min value (a passkey never used). */
    formatDate( d: DateTime ): string {
        return d.year <= 1
                ? this.#translateService.instant( 'CK.UserProfile.Passkeys.Never' )
                : d.setLocale( this.#translateService.currentLang ?? 'en' ).toLocaleString( DateTime.DATETIME_MED );
    }

    /** The model of the authenticator: a short form of its AAGUID (a name table of the authenticators is out of scope). */
    model( p: UserPasskey ): string {
        const a = String( p.aaguid );
        return /^0{8}-/.test( a ) ? '' : a.substring( 0, 8 );
    }

    isValidName( name: string ): boolean {
        return name.trim().length > 0 && name.length <= PasskeyList.maxNameLength;
    }

    startRename( p: UserPasskey ): void {
        this.editingId.set( p.passkeyId );
        this.editedName = p.name;
    }

    cancelRename(): void {
        this.editingId.set( undefined );
    }

    async renameAsync( p: UserPasskey ): Promise<void> {
        // <PreRenameAsync revert />
        const name = this.editedName.trim();
        if( !this.isValidName( name ) ) return;
        const c = new RenamePasskeyCommand();
        c.passkeyId = p.passkeyId;
        c.name = name;
        if( await this.#sendAsync( c, 'CK.UserProfile.Passkeys.Renamed' ) ) {
            this.editingId.set( undefined );
            await this.refreshAsync();
        }
        // <PostRenameAsync />
    }

    async deleteAsync( p: UserPasskey ): Promise<void> {
        // <PreDeleteAsync revert />
        const c = new DeletePasskeyCommand();
        c.passkeyId = p.passkeyId;
        if( await this.#sendAsync( c, 'CK.UserProfile.Passkeys.Deleted' ) ) {
            await this.refreshAsync();
        }
        // <PostDeleteAsync />
    }

    async onRegistered(): Promise<void> {
        this.newName = '';
        await this.refreshAsync();
    }

    // A login in a popup: the page keeps its state (the profile stays on this tab).
    async logInAgain(): Promise<void> {
        const auth = this.#auth.authService;
        if( !await this.#auth.elevateToCritical() && auth.remoteLoginError !== 'Authentication.PopupClosed' ) {
            this.#notif.notifySimpleMessage( 'error', this.#translateService.instant( auth.remoteLoginError ?? 'Login.RemoteLoginFailed' ) );
        }
    }

    // Sends a command whose result is an ICrisBasicCommandResult: its messages are in the caller's language.
    async #sendAsync( c: RenamePasskeyCommand | DeletePasskeyCommand, successKey: string ): Promise<boolean> {
        try {
            const res = await this.#cris.sendOrThrowAsync( c );
            const message = res?.userMessages[0]?.message;
            if( res?.success ) {
                this.#notif.notifySimpleMessage( 'success', message ?? this.#translateService.instant( successKey ) );
                return true;
            }
            this.#notif.notifySimpleMessage( 'error', message ?? this.#translateService.instant( 'CK.UserProfile.Passkeys.Failed' ) );
        }
        catch( error ) {
            this.#notif.notifyGenericCommunicationError();
        }
        return false;
    }
}
