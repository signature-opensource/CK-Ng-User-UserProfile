import { Component, inject, OnInit, signal, TemplateRef, viewChild } from '@angular/core';
import { FormField, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  RecoverPasswordCommand
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';

@Component( {
  selector: 'ck-recover-password-form',
  templateUrl: './recover-password-form.html',
  imports: [
    FormField,
    TranslateModule,
    FontAwesomeModule,
    NzAlertModule,
    NzButtonModule,
    NzInputModule,
    GenericForm,
    PasswordStrength
  ]
} )
export class RecoverPasswordForm implements OnInit {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #notifService = inject( NotificationService );
  readonly #route = inject( ActivatedRoute );
  readonly #router = inject( Router );
  readonly #translateService = inject( TranslateService );
  readonly #localeService = inject( LocaleService );

  protected readonly passwordIcon = faLock;
  protected readonly eyeIcon = faEye;
  protected readonly eyeSlashIcon = faEyeSlash;

  protected readonly tokenError = signal<string | null>( null );
  protected readonly submitting = signal( false );
  protected readonly showPassword = signal( false );
  protected readonly showConfirmPassword = signal( false );

  protected readonly passwordTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'passwordTemplate' );
  protected readonly passwordError = viewChild<TemplateRef<CustomFieldContext<string>>>( 'passwordError' );
  protected readonly confirmTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'confirmTemplate' );
  protected readonly confirmError = viewChild<TemplateRef<CustomFieldContext<string>>>( 'confirmError' );

  protected readonly form = genericForm( () => ( {
    password: customField( 'CK.Auth.RecoverPassword.Password.Placeholder', '', {
      template: this.passwordTemplate()!,
      errorTemplate: this.passwordError(),
      rules: p => {
        required( p, { message: 'CK.Auth.RecoverPassword.Password.Required' } );
        passwordComplexity( p );
      }
    } ),
    confirmPassword: customField( 'CK.Auth.RecoverPassword.ConfirmPassword.Placeholder', '', {
      template: this.confirmTemplate()!,
      errorTemplate: this.confirmError(),
      rules: p => required( p, { message: 'CK.Auth.RecoverPassword.ConfirmPassword.Required' } )
    } )
  } ), { rules: p => passwordsMatch( p.password, p.confirmPassword, { message: 'CK.Auth.RecoverPassword.ConfirmPassword.Mismatch' } ) } );

  #token = '';

  ngOnInit(): void {
    this.#token = this.#route.snapshot.paramMap.get( 'token' ) ?? '';
    if ( !this.#token ) {
      this.tokenError.set( this.#translateService.instant( 'CK.Auth.RecoverPassword.InvalidToken' ) );
    }
  }

  async submit(): Promise<void> {
    if ( !this.form.form().valid() || this.submitting() ) return;
    this.submitting.set( true );

    try {
      // Anonymous page as well: carry the culture the site displays so the answer and the
      // confirmation e-mail are not in the server default culture. Note that this makes Cris
      // re-dispatch the command to the CrisBackgroundExecutor, which is why its handler uses
      // RawCrisExecutor rather than ICrisCommandContext.
      const cmd = new RecoverPasswordCommand( this.#token, this.form.model().password );
      cmd.currentCultureName = this.#localeService.currentLocale();
      const res = await this.#crisEndpoint.sendOrThrowAsync( cmd );
      res?.userMessages.forEach( m => this.#notifService.notifyUserMessage( m ) );
      // Only leave the page on success: an expired or forged link must stay visible
      // with its error rather than silently bouncing to the login page.
      if ( res?.success ) {
        await this.#router.navigate( ['/auth'] );
      }
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
