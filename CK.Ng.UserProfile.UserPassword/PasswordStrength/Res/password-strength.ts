import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { PASSWORD_CRITERIA, PASSWORD_MIN_LENGTH } from '@local/ck-gen';

/** Drives both the colour of the bar and the wording above the list. */
export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

@Component( {
  selector: 'ck-password-strength',
  templateUrl: './password-strength.html',
  imports: [TranslateModule, FontAwesomeModule]
} )
export class PasswordStrength {
  /**
   * The raw value of the password control. A signal input, so everything below recomputes on its
   * own: the parent only has to bind the control value.
   */
  readonly password = input<string>( '' );

  protected readonly metIcon = faCheck;
  protected readonly unmetIcon = faXmark;
  /** Exposed for the {{minLength}} parameter of the length criterion label. */
  protected readonly minLength = PASSWORD_MIN_LENGTH;

  protected readonly results = computed( () => {
    const v = this.password();
    return PASSWORD_CRITERIA.map( c => ( { key: c.key, met: c.test( v ) } ) );
  } );

  protected readonly metCount = computed( () => this.results().filter( r => r.met ).length );

  protected readonly percent = computed( () => ( this.metCount() * 100 ) / PASSWORD_CRITERIA.length );

  protected readonly level = computed<PasswordStrengthLevel>( () => {
    const met = this.metCount();
    // Only a fully compliant password is "strong": it is also the only one the form accepts.
    if ( met === PASSWORD_CRITERIA.length ) return 'strong';
    return met >= 3 ? 'medium' : 'weak';
  } );
}
