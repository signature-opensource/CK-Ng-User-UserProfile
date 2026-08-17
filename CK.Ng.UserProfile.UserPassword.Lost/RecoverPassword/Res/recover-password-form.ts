import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  RecoverPasswordCommand
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';

@Component( {
  selector: 'ck-recover-password-form',
  templateUrl: './recover-password-form.html',
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
export class RecoverPasswordForm implements OnInit {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #formBuilder = inject( FormBuilder );
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

  #token = '';

  ngOnInit(): void {
    this.#token = this.#route.snapshot.paramMap.get( 'token' ) ?? '';
    if ( !this.#token ) {
      this.tokenError.set( this.#translateService.instant( 'CK.Auth.RecoverPassword.InvalidToken' ) );
    }
  }

  async submit(): Promise<void> {
    if ( !this.form.valid || this.submitting() ) return;
    this.submitting.set( true );

    const raw = this.form.getRawValue();
    try {
      // Anonymous page as well: carry the culture the site displays so the answer and the
      // confirmation e-mail are not in the server default culture. Note that this makes Cris
      // re-dispatch the command to the CrisBackgroundExecutor, which is why its handler uses
      // RawCrisExecutor rather than ICrisCommandContext.
      const cmd = new RecoverPasswordCommand( this.#token, raw.password );
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
