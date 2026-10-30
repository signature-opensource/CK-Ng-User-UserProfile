import { Component, linkedSignal, inject, TemplateRef, viewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormField, required } from '@angular/forms/signals';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CustomFieldContext, customField, GenericForm, genericForm, HttpCrisEndpoint, NotificationService, passwordComplexity, passwordsMatch, PasswordStrength, SetPasswordCommand, UserService } from '@local/ck-gen';

@Component( {
    selector: 'ck-change-password-form',
    imports: [
        FormField,
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        NzInputModule,
        GenericForm,
        PasswordStrength
    ],
    templateUrl: './change-password-form.html'
} )
export class ChangePasswordForm {
    // <PreDependencyInjection revert />
    readonly #userService = inject( UserService );
    readonly #cris = inject( HttpCrisEndpoint );
    readonly #notif = inject( NotificationService );
    readonly #translateService = inject( TranslateService );
    // <PostDependencyInjection />

    // <PreInputOutput revert />
    // <PostInputOutput />

    // <PreIconsDefinition revert />
    protected eyeIcon = faEye;
    protected eyeSlashIcon = faEyeSlash;
    protected xIcon = faXmark;
    protected validIcon = faCheck;
    // <PostIconsDefinition />

    // <PreLocalVariables revert />
    protected readonly passwordTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'passwordTemplate' );
    protected readonly errorTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'errorTemplate' );
    protected readonly repeatTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'repeatTemplate' );
    protected readonly repeatErrorTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'repeatErrorTemplate' );
    userProfile = linkedSignal( () => this.#userService.userProfile() );
    passwordForm = genericForm( () => ( {
        password: customField( 'CK.UserProfile.Password', '', {
            template: this.passwordTemplate()!,
            errorTemplate: this.errorTemplate(),
            requiredMark: false,
            rules: p => {
                required( p, { message: 'CK.UserProfile.Form.PasswordRequired' } );
                // The length is one of PASSWORD_CRITERIA, which passwordComplexity enforces: a
                // minLength here would report the same failure twice.
                passwordComplexity( p );
            }
        } ),
        repeat: customField( 'CK.UserProfile.RepeatPassword', '', {
            template: this.repeatTemplate()!,
            errorTemplate: this.repeatErrorTemplate(),
            requiredMark: false,
            rules: p => required( p, { message: 'CK.UserProfile.Form.RepeatPasswordRequired' } )
        } )
    } ), { rules: p => passwordsMatch( p.password, p.repeat, { message: 'CK.UserProfile.Form.PasswordMustMatch' } ) } );
    showPassword: boolean = false;
    showRepeatPassword: boolean = false;
    // <PostLocalVariables />

    #submitting?: Promise<void>;

    cancel(): void {
        this.passwordForm.reset();
    }

    async setPasswordAsync(): Promise<void> {
        // <PreSetPasswordAsync revert />
        if ( this.passwordForm.form().valid() ) {
            // A second Enter or click while the command is in flight shares its outcome instead of sending it again.
            this.#submitting ??= this.#sendSetPasswordAsync().finally( () => this.#submitting = undefined );
            return this.#submitting;
        }
        return Promise.reject();
        // <PostSetPasswordAsync />
    }

    /**
     * Called on Enter in the form (the GenericForm `submitRequested` output): submits as Confirm does.
     */
    async keyDown(): Promise<void> {
        // <PreKeyDown revert />
        await this.setPasswordAsync();
        // <PostKeyDown />
    }

    async #sendSetPasswordAsync(): Promise<void> {
        try {
            const res = await this.#cris.sendOrThrowAsync( new SetPasswordCommand( this.userProfile()!.userId, this.passwordForm.model().password ) );
            if ( res ) {
                this.#notif.notifySimpleMessage( 'success', this.#translateService.instant( 'User.PasswordSet' ) );
                this.passwordForm.reset();
                return Promise.resolve();
            }
            return Promise.reject();
        } catch ( error ) {
            this.#notif.notifyGenericCommunicationError();
            return Promise.reject();
        }
    }
}
