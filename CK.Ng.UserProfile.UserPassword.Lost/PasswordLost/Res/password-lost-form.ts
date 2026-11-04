import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { email, FormField, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

import {
  CustomFieldContext,
  customField,
  GenericForm,
  genericForm,
  HttpCrisEndpoint,
  NotificationService,
  SendForgotPasswordEmailCommand
} from '@local/ck-gen';
import { LocaleService } from '@local/ck-gen/ts-locales/locales';

@Component( {
  selector: 'ck-password-lost-form',
  templateUrl: './password-lost-form.html',
  imports: [
    FormField,
    TranslatePipe,
    FontAwesomeModule,
    NzButtonModule,
    NzInputModule,
    GenericForm
  ]
} )
export class PasswordLostForm {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #notifService = inject( NotificationService );
  readonly #localeService = inject( LocaleService );

  protected readonly emailIcon = faEnvelope;

  protected readonly submitting = signal( false );
  protected readonly submitted = signal( false );

  protected readonly emailTemplate = viewChild<TemplateRef<CustomFieldContext<string>>>( 'emailTemplate' );
  protected readonly emailError = viewChild<TemplateRef<CustomFieldContext<string>>>( 'emailError' );

  // A custom field rather than a text field: the input keeps type="email", which the
  // browser trims and which brings the e-mail keyboard on mobile.
  protected readonly form = genericForm( () => ( {
    email: customField( 'CK.Auth.PasswordLost.Email.Placeholder', '', {
      template: this.emailTemplate()!,
      errorTemplate: this.emailError(),
      rules: p => {
        required( p, { message: 'CK.Auth.PasswordLost.Email.Required' } );
        email( p, { message: 'CK.Auth.PasswordLost.Email.Invalid' } );
      }
    } )
  } ) );

  async submit(): Promise<void> {
    if ( !this.form.form().valid() || this.submitting() ) return;
    this.submitting.set( true );

    try {
      // This page is anonymous: no user profile has set the ambient culture yet, so the
      // command would default to the server culture. Carry the one the site displays,
      // both for the answer and for the e-mail that gets rendered.
      const cmd = new SendForgotPasswordEmailCommand( this.form.model().email.trim() );
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
