import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormField, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

import {
  CustomFieldContext,
  customField,
  GenericForm,
  genericForm,
  HttpCrisEndpoint,
  NotificationService,
  passwordComplexity,
  passwordsMatch,
  PasswordStrength,
  SetPasswordCommand,
  UserService
} from '@local/ck-gen';

@Component( {
  selector: 'ck-reset-password-form',
  templateUrl: './reset-password-form.html',
  imports: [
    FormField,
    TranslatePipe,
    RouterLink,
    FontAwesomeModule,
    NzAlertModule,
    NzButtonModule,
    NzInputModule,
    GenericForm,
    PasswordStrength
  ]
} )
export class ResetPasswordForm {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
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

  protected readonly passwordTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'passwordTemplate' );
  protected readonly passwordError = viewChild<TemplateRef<CustomFieldContext<string>>>( 'passwordError' );
  protected readonly confirmTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'confirmTemplate' );
  protected readonly confirmError = viewChild<TemplateRef<CustomFieldContext<string>>>( 'confirmError' );

  protected readonly form = genericForm( () => ( {
    password: customField( 'CK.Auth.ResetPassword.Password.Placeholder', '', {
      template: this.passwordTemplate()!,
      errorTemplate: this.passwordError(),
      rules: p => {
        required( p, { message: 'CK.Auth.ResetPassword.Password.Required' } );
        passwordComplexity( p );
      }
    } ),
    confirmPassword: customField( 'CK.Auth.ResetPassword.ConfirmPassword.Placeholder', '', {
      template: this.confirmTemplate()!,
      errorTemplate: this.confirmError(),
      rules: p => required( p, { message: 'CK.Auth.ResetPassword.ConfirmPassword.Required' } )
    } )
  } ), { rules: p => passwordsMatch( p.password, p.confirmPassword, { message: 'CK.Auth.ResetPassword.ConfirmPassword.Mismatch' } ) } );

  async submit(): Promise<void> {
    if ( !this.form.form().valid() || this.submitting() ) return;
    this.submitting.set( true );

    try {
      const userId = this.#userService.userProfile()!.userId;
      // isTemporary defaults to false: the user chose this password, so the temporary state is cleared.
      const res = await this.#crisEndpoint.sendOrThrowAsync( new SetPasswordCommand( userId, this.form.model().password ) );
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
