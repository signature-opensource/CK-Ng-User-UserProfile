import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AuthLevel, ChangePasswordForm, HttpCrisEndpoint, NgAuthService, NotificationService, RemovePasswordCommand, UserService } from '@local/ck-gen';

@Component( {
    selector: 'ck-password-section',
    imports: [
        TranslateModule,
        NzButtonModule,
        NzPopconfirmModule,
        ChangePasswordForm
    ],
    templateUrl: './password-section.html'
} )
export class PasswordSection implements OnInit {
    // <PreDependencyInjection revert />
    readonly #auth = inject( NgAuthService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( NotificationService );
    readonly #translateService = inject( TranslateService );
    readonly #userService = inject( UserService );
    // <PostDependencyInjection />

    // <PreLocalVariables revert />
    /**
     * Whether the user has a password: the "Basic" scheme of its authentication, then what this section did (the
     * schemes of the authentication are the ones of the last sign-in or refresh).
     */
    readonly hasPassword = linkedSignal( () => this.#auth.authenticationInfo().unsafeActor.schemes.some( s => s.scheme === 'Basic' ) );
    // The user name: the sign-in name of the "Basic" scheme.
    readonly userName = computed( () => this.#userService.userProfile()?.userName ?? this.#auth.authenticationInfo().unsafeActor.actorName );
    protected readonly busy = signal( false );
    // The three operations require a recent login (the Critical level) and are refused while impersonating.
    protected readonly isImpersonated = this.#auth.isImpersonated;
    protected readonly isCritical = computed( () => this.#auth.level() === AuthLevel.Critical );
    protected readonly canReachCritical = this.#auth.canReachCritical;
    // <PostLocalVariables />

    async ngOnInit(): Promise<void> {
        // The schemes tell whether the user can reach the Critical level.
        if( this.#auth.availableSchemes().length === 0 ) await this.#auth.refreshSchemesAsync();
    }

    logInAgain(): void {
        void this.#auth.navigateToCriticalLogin();
    }

    onPasswordSet(): void {
        this.hasPassword.set( true );
    }

    /**
     * Removes the password of the user. Refused by the server when it is the user's last way to sign in.
     */
    async removeAsync(): Promise<void> {
        // <PreRemoveAsync revert />
        this.busy.set( true );
        try {
            const res = await this.#cris.sendOrThrowAsync( new RemovePasswordCommand() );
            // The server's messages are in the caller's language: "removed", or why not (the last sign-in method).
            const message = res?.userMessages[0]?.message;
            if( res?.success ) {
                this.#notif.notifySimpleMessage( 'success', message ?? this.#translateService.instant( 'CK.UserProfile.PasswordRemoved' ) );
                this.hasPassword.set( false );
            }
            else {
                this.#notif.notifySimpleMessage( 'error', message ?? this.#translateService.instant( 'CK.UserProfile.PasswordNotRemoved' ) );
            }
        }
        catch( error ) {
            this.#notif.notifyGenericCommunicationError();
        }
        finally {
            this.busy.set( false );
        }
        // <PostRemoveAsync />
    }
}
