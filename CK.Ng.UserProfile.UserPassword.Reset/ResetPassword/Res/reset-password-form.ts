import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import {
  HttpCrisEndpoint,
  NotificationService,
  PASSWORD_MIN_LENGTH,
  passwordComplexityValidator,
  passwordsMatchValidator,
  SetPasswordCommand,
  UserService
} from '@local/ck-gen';

@Component( {
  selector: 'ck-reset-password-form',
  templateUrl: './reset-password-form.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FontAwesomeModule,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule
  ]
} )
export class ResetPasswordForm {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #formBuilder = inject( FormBuilder );
  readonly #notifService = inject( NotificationService );
  readonly #router = inject( Router );
  readonly #translateService = inject( TranslateService );
  readonly #userService = inject( UserService );

  protected readonly passwordIcon = faLock;
  protected readonly eyeIcon = faEye;
  protected readonly eyeSlashIcon = faEyeSlash;

  protected readonly submitting = signal( false );
  protected readonly showPassword = signal( false );
  protected readonly showConfirmPassword = signal( false );

  protected readonly form: FormGroup = this.#formBuilder.group(
    {
      password: new FormControl<string>( '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength( PASSWORD_MIN_LENGTH ), passwordComplexityValidator]
      } ),
      confirmPassword: new FormControl<string>( '', { nonNullable: true, validators: [Validators.required] } )
    },
    { validators: [passwordsMatchValidator( 'password', 'confirmPassword' )] }
  );

  async submit(): Promise<void> {
    if ( !this.form.valid || this.submitting() ) return;
    this.submitting.set( true );

    const raw = this.form.getRawValue();
    try {
      const userId = this.#userService.userProfile()!.userId;
      // isTemporary defaults to false: the user chose this password, so the temporary state is cleared.
      const res = await this.#crisEndpoint.sendOrThrowAsync( new SetPasswordCommand( userId, raw.password ) );
      if ( res?.success ) {
        // Refreshing the profile clears isTemporaryPassword, which releases the navigation guard.
        await this.#userService.refreshUserProfileAsync();
        this.#notifService.notifySimpleMessage( 'success', this.#translateService.instant( 'CK.Auth.ResetPassword.Success' ) );
        await this.#router.navigate( ['/'] );
      } else {
        this.#notifService.notifySimpleMessage( 'error', this.#translateService.instant( 'CK.Auth.ResetPassword.Failed' ) );
      }
    } catch {
      this.#notifService.notifyGenericCommunicationError();
    } finally {
      this.submitting.set( false );
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update( v => !v );
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update( v => !v );
  }
}
