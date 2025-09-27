import { Component, linkedSignal, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { checkPasswords } from './form-validators';
import { HttpCrisEndpoint, NotificationService, SetPasswordCommand, UserService } from '@local/ck-gen';

@Component( {
    selector: 'ck-user-password-form',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        FontAwesomeModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule
    ],
    templateUrl: './user-password-form.html'
} )
export class UserPasswordForm {
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
    #passwordMinLength: number = 6;
    formGroup: FormGroup = this.#formBuilder.group( {
        password: new FormControl( '', { nonNullable: true, validators: [Validators.required, Validators.minLength( this.#passwordMinLength )] } ),
        repeat: new FormControl( '', { nonNullable: true, validators: [Validators.minLength( this.#passwordMinLength )] } ),
    }, { validators: [checkPasswords( 'password', 'repeat', 'mismatch' )] } );
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

    getMinLengthError(): string {
        return this.#translateService.instant( 'CK.UserProfile.Form.PasswordLengthError', { minLength: this.#passwordMinLength } );
    }
}
