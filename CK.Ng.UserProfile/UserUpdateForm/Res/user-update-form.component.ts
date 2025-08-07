import { Component, computed, inject, linkedSignal, Signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    CKNotificationService,
    CrisError,
    FormControlConfig,
    IFormControlConfig,
    GenericFormComponent,
    HttpCrisEndpoint,
    SetUserNameCommand,
    UpdateUserCommand,
    UserService
} from '@local/ck-gen';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
    selector: 'ck-user-update-form',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        GenericFormComponent
    ],
    templateUrl: './user-update-form.component.html'
})
export class UserUpdateFormComponent {
    // <PreViewChildren revert />
    formComponent: Signal<GenericFormComponent | undefined> = viewChild( 'formComp' );
    // <PostViewChildren />

    // <PreDependencyInjection revert />
    readonly #userService = inject( UserService );
    readonly #translateService = inject( TranslateService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( CKNotificationService );
    // <PostDependencyInjection />

    // <PreInputOutput revert />
    // <PostInputOutput />

    // <PreIconsDefinition revert />
    protected checkIcon = faCheck;
    protected cancelIcon = faXmark;
    // <PostIconsDefinition />

    // <PreLocalVariables revert />
    userProfile = linkedSignal( () => this.#userService.userProfile() );
    formData = computed( () => {
        if ( this.userProfile() ) {
            return { formControls: this.#generateUserUpdateFormConfig() }
        }

        return undefined;
    } );
    form = computed( () => this.formComponent()?.form() );
    // <PostLocalVariables />

    async updateUserAsync(): Promise<void> {
        if ( this.formComponent() && this.form() ) {
            const form = this.form()!;
            if ( form.invalid ) {
                return Promise.reject();
            }

            try {
                // <PreUpdateUserBatchCommand revert />
                const batchCmd = new UpdateUserCommand();

                // <PreSetUserNameCommandRegistering revert />
                if (form.get('userName')!.value !== this.userProfile()!.userName) {
                    const userNameCmd = new SetUserNameCommand();

                    userNameCmd.actorId = this.userProfile()!.userId;

                    userNameCmd.userId = this.userProfile()!.userId;
                    userNameCmd.userName = form.get( 'userName' )!.value;
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

        return Promise.reject();
    }

    cancelModifications(): void {
        if ( this.formComponent() && this.form() ) {
          // <PreCancelModifications revert />
            this.form()!.reset();
            this.form()!.patchValue( {
                // <PreUserNameReset revert />
                userName: this.userProfile()!.userName,
                // <PostUserNameReset />
            } );
          // <PostCancelModifications />
        }
    }

    #generateUserUpdateFormConfig(): { [key: string]: IFormControlConfig<unknown, unknown> } {
        if ( !this.userProfile() ) return {};

        // <PreUserIdentityFormControlDefinition revert />

        // <PreUserNameFormControlDefinition revert />
        const userName = new FormControlConfig(
            'text',
            this.#translateService.instant( 'CK.UserProfile.UserName' ),
            this.userProfile()!.userName,
            {
                placeholder: this.#translateService.instant( 'CK.UserProfile.UserNamePlaceholder' ),
                validators: [Validators.required],
                required: false,
                errorMessages: { 'required': this.#translateService.instant( 'CK.UserProfile.Form.UserNameRequired' ) }
            }
        );
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
