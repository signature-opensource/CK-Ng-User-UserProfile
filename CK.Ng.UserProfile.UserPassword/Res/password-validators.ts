import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PASSWORD_CRITERIA } from './password-rules';

/**
 * Requires every criterion of {@link PASSWORD_CRITERIA}.
 * Attach to a single password FormControl.
 * Emits `{ passwordComplexity: <keys of the unmet criteria> }` on failure — the keys rather than a
 * bare `true` so that a caller can tell what is missing without re-running the tests.
 *
 * Says nothing about an empty value: that is what `Validators.required` is for.
 */
export const passwordComplexityValidator: ValidatorFn = ( control: AbstractControl ): ValidationErrors | null => {
  const val = ( control.value ?? '' ) as string;
  if ( val.length === 0 ) return null;
  const unmet = PASSWORD_CRITERIA.filter( c => !c.test( val ) ).map( c => c.key );
  return unmet.length ? { passwordComplexity: unmet } : null;
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
