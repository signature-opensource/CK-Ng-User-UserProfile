import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;

/**
 * Requires at least three of: uppercase letter, lowercase letter, digit, special character.
 * Attach to a single password FormControl.
 * Emits `{ passwordComplexity: true }` on failure.
 */
export const passwordComplexityValidator: ValidatorFn = ( control: AbstractControl ): ValidationErrors | null => {
  const val = ( control.value ?? '' ) as string;
  if ( val.length === 0 ) return null;
  const hasUpper = /[A-Z]/.test( val );
  const hasLower = /[a-z]/.test( val );
  const hasDigit = /\d/.test( val );
  const hasSpecial = /[^A-Za-z0-9]/.test( val );
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter( Boolean ).length;
  return score >= 3 ? null : { passwordComplexity: true };
};

/**
 * Cross-field validator factory — attach to a FormGroup to verify two password fields match.
 * Emits `{ passwordMismatch: true }` on the group AND propagates the same error onto the confirm
 * control so ng-zorro's `nzErrorTip` (which reads errors from the control, not the group) displays it.
 */
export function passwordsMatchValidator( passwordField: string, confirmField: string ): ValidatorFn {
  return ( group: AbstractControl ): ValidationErrors | null => {
    const pwdCtrl = group.get( passwordField );
    const confCtrl = group.get( confirmField );
    if ( !pwdCtrl || !confCtrl ) return null;

    const pwd = pwdCtrl.value as string;
    const conf = confCtrl.value as string;

    if ( pwd && conf && pwd !== conf ) {
      confCtrl.setErrors( { ...( confCtrl.errors ?? {} ), passwordMismatch: true } );
      return { passwordMismatch: true };
    }

    if ( confCtrl.hasError( 'passwordMismatch' ) ) {
      const remaining = { ...confCtrl.errors };
      delete remaining[ 'passwordMismatch' ];
      confCtrl.setErrors( Object.keys( remaining ).length ? remaining : null );
    }
    return null;
  };
}
