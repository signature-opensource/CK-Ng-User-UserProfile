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
  ResetPasswordCommand
} from '@local/ck-gen';

@Component( {
  selector: 'ck-reset-password',
  templateUrl: './reset-password.html',
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
export class ResetPassword implements OnInit {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #formBuilder = inject( FormBuilder );
  readonly #notifService = inject( NotificationService );
  readonly #route = inject( ActivatedRoute );
  readonly #router = inject( Router );
  readonly #translateService = inject( TranslateService );

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
      this.tokenError.set( this.#translateService.instant( 'CK.Auth.ResetPassword.InvalidToken' ) );
    }
  }

  async submit(): Promise<void> {
    if ( !this.form.valid || this.submitting() ) return;
    this.submitting.set( true );

    const raw = this.form.getRawValue();
    try {
      const res = await this.#crisEndpoint.sendOrThrowAsync(
        new ResetPasswordCommand( this.#token, raw.password )
      );
      if ( res ) this.#notifService.notifyUserMessage( res );
      await this.#router.navigate( ['/auth'] );
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
