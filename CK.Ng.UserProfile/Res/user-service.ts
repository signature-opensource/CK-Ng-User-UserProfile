import { effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AuthLevel, GetUserProfileQCommand, HttpCrisEndpoint, NgAuthService, UserProfile } from '@local/ck-gen';

@Injectable({ providedIn: 'root' })
export class UserService {
    // <PreDependencyInjection revert />
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #authService = inject( NgAuthService );
    // <PostDependencyInjection />

    // <PreLocalVariables revert />
    #userProfile: WritableSignal<UserProfile | undefined> = signal( undefined );
    userProfile: Signal<UserProfile | undefined> = this.#userProfile.asReadonly();
    // userProfile() is undefined both before the first read and when not authenticated: this
    // distinguishes the two, so that a caller can wait for the profile instead of assuming there
    // is none. It settles even when the read failed (see refreshUserProfileAsync).
    #profileLoaded: WritableSignal<boolean> = signal( false );
    profileLoaded: Signal<boolean> = this.#profileLoaded.asReadonly();
    // <PostLocalVariables />

    constructor() {
        effect( async () => {
            if ( this.#authService.authenticationInfo().level < AuthLevel.Normal ) {
                this.#userProfile.set( undefined );
                this.#profileLoaded.set( false );
            } else {
                await this.refreshUserProfileAsync();
            }
        } );
    }

    async refreshUserProfileAsync(): Promise<void> {
        // <PreUserProfileRefresh revert />
        try {
            const res = await this.#cris.sendOrThrowAsync( new GetUserProfileQCommand( this.#authService.authenticationInfo().user.userId ) );
            this.#userProfile.set( res );
            // <PostUserProfileRefresh />
        }
        finally {
            // Settled even on failure: anything awaiting profileLoaded (a navigation guard, typically)
            // would otherwise wait forever and freeze the whole application.
            this.#profileLoaded.set( true );
        }
    }
}
