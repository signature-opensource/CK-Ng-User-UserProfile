import { Component, effect, inject, linkedSignal, untracked } from '@angular/core';
import { required } from '@angular/forms/signals';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    NotificationService,
    CrisError,
    GenericForm,
    genericForm,
    HttpCrisEndpoint,
    SetUserNameCommand,
    textField,
    UpdateUserCommand,
    UserService
} from '@local/ck-gen';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'ck-user-update-form',
    imports: [
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        GenericForm
    ],
    templateUrl: './user-update-form.html'
})
export class UserUpdateForm {
    // <PreViewChildren revert />
    // <PostViewChildren />

    // <PreDependencyInjection revert />
    readonly #userService = inject( UserService );
    readonly #translateService = inject( TranslateService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( NotificationService );
    // <PostDependencyInjection />

    // <PreInputOutput revert />
    // <PostInputOutput />

    // <PreIconsDefinition revert />
    protected checkIcon = faCheck;
    protected cancelIcon = faXmark;
    // <PostIconsDefinition />

    // <PreLocalVariables revert />
    userProfile = linkedSignal( () => this.#userService.userProfile() );
    /** The field defaults are the current profile values: {@link cancelModifications} and a new profile put them back. */
    profileForm = genericForm( () => this.#fields() );
    // <PostLocalVariables />

    constructor() {
        // Only the profile is tracked: a language change must not reset the user's edits.
        effect( () => {
            this.userProfile();
            untracked( () => this.profileForm.reset() );
        } );
    }

    async updateUserAsync(): Promise<void> {
        if( !this.userProfile() || this.profileForm.form().invalid() ) {
            return Promise.reject();
        }

        const value = this.profileForm.model();
        try {
            // <PreUpdateUserBatchCommand revert />
            const batchCmd = new UpdateUserCommand();

            // <PreSetUserNameCommandRegistering revert />
            if( value.userName !== this.userProfile()!.userName ) {
                const userNameCmd = new SetUserNameCommand();

                userNameCmd.actorId = this.userProfile()!.userId;

                userNameCmd.userId = this.userProfile()!.userId;
                userNameCmd.userName = value.userName.trim();
                batchCmd.commands.push( { command: userNameCmd, description: 'Setting user\'s username.' } );
            }
            // <PostSetUserNameCommandRegistering />

            const res = await this.#cris.sendOrThrowAsync( batchCmd );
            // <PostUpdateUserBatchCommand />

            if ( res?.success ) {
                await this.#userService.refreshUserProfileAsync();
                this.#notif.notifySimpleMessage( 'success', this.#translateService.instant( 'User.UserUpdated' ) );
            } else {
                this.#notif.notifySimpleMessage( 'error', this.#translateService.instant( 'User.UserUpdateFailed' ) );
                return Promise.reject();
            }
        } catch (e) {
            if ( e instanceof CrisError && e.errorType === 'CommunicationError' ) {
                this.#notif.notifyGenericCommunicationError();
            } else {
                this.#notif.notifySimpleMessage( 'error', this.#translateService.instant( 'User.UserUpdateFailed' ) );
            }
            return Promise.reject();
        }

        this.cancelModifications();
    }

    cancelModifications(): void {
        // <PreCancelModifications revert />
        this.profileForm.reset();
    }

    #fields() {
        // <PreUserIdentityFormControlDefinition revert />

        // <PreUserNameFormControlDefinition revert />
        const userName = textField( 'CK.UserProfile.UserName', this.userProfile()?.userName ?? '', {
            placeholder: 'CK.UserProfile.UserNamePlaceholder',
            requiredMark: false,
            rules: p => required( p, { message: 'CK.UserProfile.Form.UserNameRequired' } )
        } );
        // <PostUserNameFormControlDefinition />

        // <PostUserIdentityFormControlDefinition />

        // <PreUserPreferencesFormControlDefinition revert />
        // <PostUserPreferencesFormControlDefinition />

        return {
            // <PreUserIdentityFormControlRegistration revert />

            // <PreUserNameFormControlRegistration revert />
            userName,
            // <PostUserNameFormControlRegistration />

            // <PostUserIdentityFormControlRegistration />

            // <PreUserPreferencesFormControlRegistration revert />
            // <PostUserPreferencesFormControlRegistration />
        };
    }
}
