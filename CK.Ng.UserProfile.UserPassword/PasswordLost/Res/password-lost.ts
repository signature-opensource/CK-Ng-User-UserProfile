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

@Component( {
  selector: 'ck-password-lost',
  templateUrl: './password-lost.html',
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
export class PasswordLost {
  readonly #crisEndpoint = inject( HttpCrisEndpoint );
  readonly #formBuilder = inject( FormBuilder );
  readonly #notifService = inject( NotificationService );

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
      const res = await this.#crisEndpoint.sendOrThrowAsync(
        new SendForgotPasswordEmailCommand( this.form.get( 'email' )!.value.trim() )
      );
      if ( res ) this.#notifService.notifyUserMessage( res );
      this.submitted.set( true );
    } finally {
      this.submitting.set( false );
    }
  }
}
