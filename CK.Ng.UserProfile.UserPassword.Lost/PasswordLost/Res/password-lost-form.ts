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
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import {
  HttpCrisEndpoint,
  NotificationService,
  SendForgotPasswordEmailCommand
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';

@Component( {
  selector: 'ck-password-lost-form',
  templateUrl: './password-lost-form.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FontAwesomeModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule
  ]
} )
export class PasswordLostForm {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #formBuilder = inject( FormBuilder );
  readonly #notifService = inject( NotificationService );
  readonly #localeService = inject( LocaleService );

  protected readonly emailIcon = faEnvelope;

  protected readonly submitting = signal( false );
  protected readonly submitted = signal( false );

  protected readonly form: FormGroup = this.#formBuilder.group( {
    email: new FormControl<string>( '', { nonNullable: true, validators: [Validators.required, Validators.email] } )
  } );

  async submit(): Promise<void> {
    if ( !this.form.valid || this.submitting() ) return;
    this.submitting.set( true );

    try {
      // This page is anonymous: no user profile has set the ambient culture yet, so the
      // command would default to the server culture. Carry the one the site displays,
      // both for the answer and for the e-mail that gets rendered.
      const cmd = new SendForgotPasswordEmailCommand( this.form.get( 'email' )!.value.trim() );
      cmd.currentCultureName = this.#localeService.currentLocale();
      const res = await this.#crisEndpoint.sendOrThrowAsync( cmd );
      res?.userMessages.forEach( m => this.#notifService.notifyUserMessage( m ) );
      // The answer is the same whether the address is known or not, so the confirmation
      // screen is shown in both cases.
      this.submitted.set( true );
    } finally {
      this.submitting.set( false );
    }
  }
}
