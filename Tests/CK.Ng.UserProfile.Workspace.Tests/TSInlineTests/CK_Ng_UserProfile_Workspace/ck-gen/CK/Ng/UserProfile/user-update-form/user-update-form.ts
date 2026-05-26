import { Component, computed, inject, linkedSignal, Signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NotificationService } from '@local/ck-gen/CK/Ng/Zorro/notification.service';
import { CrisError } from '@local/ck-gen/CK/Cris/Model';
import { FormControlConfig, IFormControlConfig } from '@local/ck-gen/CK/Ng/Zorro/generic-form/generic-form-model';
import { GenericForm } from '@local/ck-gen/CK/Ng/Zorro/generic-form/generic-form';
import { HttpCrisEndpoint } from '@local/ck-gen/CK/Cris/HttpCrisEndpoint';
import { SetUserNameCommand } from '@local/ck-gen/CK/IO/Actor/SetUserNameCommand';
import { UpdateUserCommand } from '@local/ck-gen/CK/IO/Actor/UpdateUserCommand';
import { UserService } from '@local/ck-gen/CK/Ng/UserProfile/user-service';
import { SetPreferredWorkspaceIdCommand } from '@local/ck-gen/CK/IO/UserProfile/Workspace/SetPreferredWorkspaceIdCommand';

@Component({
    selector: 'ck-user-update-form',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        GenericForm
    ],
    templateUrl: './user-update-form.html'
})
export class UserUpdateForm {
    // <PreViewChildren revert />
    formComponent: Signal<GenericForm | undefined> = viewChild( 'formComp' );
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
    #currentLang = toSignal( this.#translateService.onLangChange );
    userProfile = linkedSignal( () => this.#userService.userProfile() );
    formData = computed( () => {
        const _lang = this.#currentLang(); // Track language changes to re-generate form labels.
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
                    userNameCmd.userName = form.get( 'userName' )!.value.trim();
                    batchCmd.commands.push( { command: userNameCmd, description: 'Setting user\'s username.' } );
                }
                //<PostSetUserNameCommandRegistering >
                
                // <PreSetPreferredWorkspaceIdCommandRegistering />
                if( form.get( 'preferredWorkspaceId' )!.value !== this.userProfile()!.preferredWorkspaceId ) {
                    const setWorkspaceCmd = new SetPreferredWorkspaceIdCommand();
                
                    setWorkspaceCmd.userId = this.userProfile()!.userId;
                    setWorkspaceCmd.workspaceId = form.get( 'preferredWorkspaceId' )!.value;
                    batchCmd.commands.push( { command: setWorkspaceCmd, description: 'Setting user\'s preferred workspace.' } );
                }
                // <PostSetPreferredWorkspaceIdCommandRegistering />
                //</PostSetUserNameCommandRegistering>

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
                //<PostUserNameReset >
                // <PrePreferredWorkspaceReset revert />
                preferredWorkspaceId: this.userProfile()!.preferredWorkspaceId,
                // <PostPreferredWorkspaceReset />
                //</PostUserNameReset>
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

        //<PreUserPreferencesFormControlDefinition revert>
        
        // <PrePreferredWorkspaceFormControlDefinition revert />
        const preferredWorkspaceId = new FormControlConfig(
            'select',
            this.#translateService.instant( 'CK.UserProfile.PreferredWorkspace' ),
            this.userProfile()!.preferredWorkspaceId,
            {
                options: this.userProfile()!.groups
                    .filter( g => g.isZone )
                    .map( g => ({ label: g.groupName, value: g.groupId }) ),
                show: () => this.userProfile()!.groups.some( g => g.isZone )
            }
        );
        // <PostPreferredWorkspaceFormControlDefinition />
        
        //</PreUserPreferencesFormControlDefinition>
        // <PostUserPreferencesFormControlDefinition />

        return {
            // <PreUserIdentityFormControlRegistration revert />

            // <PreUserNameFormControlRegistration revert />
            userName,
            // <PostUserNameFormControlRegistration />

            // <PostUserIdentityFormControlRegistration />

            //<PreUserPreferencesFormControlRegistration revert>
            
            preferredWorkspaceId,
            
            //</PreUserPreferencesFormControlRegistration>
            // <PostUserPreferencesFormControlRegistration />
        };
    }
}
