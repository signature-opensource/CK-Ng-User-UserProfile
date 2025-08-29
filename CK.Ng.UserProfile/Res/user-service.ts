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
    // <PostLocalVariables />

    constructor() {
        effect( async () => {
            if ( this.#authService.authenticationInfo().level < AuthLevel.Normal ) {
                this.#userProfile.set( undefined );
            } else {
                await this.refreshUserProfileAsync();
            }
        } );
    }

    async refreshUserProfileAsync(): Promise<void> {
        // <PreUserProfileRefresh revert />
        const res = await this.#cris.sendOrThrowAsync( new GetUserProfileQCommand( this.#authService.authenticationInfo().user.userId ) );
        this.#userProfile.set(res);
        // <PostUserProfileRefresh />
    }
}
