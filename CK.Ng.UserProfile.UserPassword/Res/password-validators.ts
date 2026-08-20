import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_MIN_LENGTH = 8;

/**
 * One rule a password must satisfy, both as a predicate and as something to display.
 */
export interface PasswordCriterion {
  /** Suffix of the translation key: `CK.UserProfile.PasswordStrength.Criterion.<key>`. */
  readonly key: string;
  readonly test: ( value: string ) => boolean;
}

/**
 * The password rule, in display order. This table IS the rule: `passwordComplexityValidator` and
 * the `ck-password-strength` component both read it, so what the user is shown and what blocks
 * the submission cannot drift apart.
 *
 * Note that the length is one criterion among the others: do NOT add a separate
 * `Validators.minLength( PASSWORD_MIN_LENGTH )` on a control that already carries
 * `passwordComplexityValidator`, it would report the same failure twice.
 */
export const PASSWORD_CRITERIA: readonly PasswordCriterion[] = [
  { key: 'MinLength', test: v => v.length >= PASSWORD_MIN_LENGTH },
  { key: 'Digit', test: v => /\d/.test( v ) },
  { key: 'Lower', test: v => /[a-z]/.test( v ) },
  { key: 'Upper', test: v => /[A-Z]/.test( v ) },
  { key: 'Special', test: v => /[^A-Za-z0-9]/.test( v ) }
];

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
