import { Component, linkedSignal, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HttpCrisEndpoint, NotificationService, PasswordStrength, passwordComplexityValidator, passwordsMatchValidator, SetPasswordCommand, UserService } from '@local/ck-gen';

@Component( {
    selector: 'ck-change-password-form',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule,
        PasswordStrength
    ],
    templateUrl: './change-password-form.html'
} )
export class ChangePasswordForm {
    // <PreDependencyInjection revert />
    readonly #userService = inject( UserService );
    readonly #formBuilder = inject( FormBuilder );
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
    userProfile = linkedSignal( () => this.#userService.userProfile() );
    formGroup: FormGroup = this.#formBuilder.group( {
        // The length is one of PASSWORD_CRITERIA, which passwordComplexityValidator enforces: a
        // Validators.minLength here would report the same failure twice.
        password: new FormControl( '', { nonNullable: true, validators: [Validators.required, passwordComplexityValidator] } ),
        repeat: new FormControl( '', { nonNullable: true, validators: [Validators.required] } ),
    }, { validators: [passwordsMatchValidator( 'password', 'repeat' )] } );
    showPassword: boolean = false;
    showRepeatPassword: boolean = false;
    // <PostLocalVariables />

    cancel(): void {
        this.formGroup.reset();
    }

    async setPasswordAsync(): Promise<void> {
        // <PreSetPasswordAsync revert />
        if ( this.formGroup.valid ) {
            try {
                const res = await this.#cris.sendOrThrowAsync( new SetPasswordCommand( this.userProfile()!.userId, this.formGroup.get( 'password' )!.value ) );
                if ( res ) {
                    this.#notif.notifySimpleMessage( 'success', this.#translateService.instant( 'User.PasswordSet' ) );
                    this.formGroup.reset();
                    return Promise.resolve();
                }
                return Promise.reject();
            } catch ( error ) {
                this.#notif.notifyGenericCommunicationError();
                return Promise.reject();
            }
        }
        return Promise.reject();
        // <PostSetPasswordAsync />
    }

    async keyDown( event: KeyboardEvent ): Promise<void> {
        // <PreKeyDown revert />
        if ( event.code === "Enter" ) {
            await this.setPasswordAsync();
        }
        // <PostKeyDown />
    }
}
