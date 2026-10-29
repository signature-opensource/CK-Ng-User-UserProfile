import { SchemaPath, validate } from '@angular/forms/signals';

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
 * The password rule, in display order. This table is the rule itself: `passwordComplexity` and
 * the `ck-password-strength` component both read it, so what the user is shown and what blocks
 * the submission cannot drift apart.
 *
 * The length is one criterion among the others: do not add a separate
 * `minLength( path, PASSWORD_MIN_LENGTH )` on a field that already carries `passwordComplexity`,
 * it would report the same failure twice.
 */
export const PASSWORD_CRITERIA: readonly PasswordCriterion[] = [
  { key: 'MinLength', test: v => v.length >= PASSWORD_MIN_LENGTH },
  { key: 'Digit', test: v => /\d/.test( v ) },
  { key: 'Lower', test: v => /[a-z]/.test( v ) },
  { key: 'Upper', test: v => /[A-Z]/.test( v ) },
  { key: 'Special', test: v => /[^A-Za-z0-9]/.test( v ) }
];

/**
 * Requires every criterion of {@link PASSWORD_CRITERIA} on a password field.
 * On failure the field carries one error `{ kind: 'passwordComplexity', unmet, message? }` where
 * `unmet` lists the keys of the unmet criteria in display order, so a caller can tell what is
 * missing without re-running the tests.
 *
 * Says nothing about an empty value: that is what `required` is for.
 */
export function passwordComplexity( path: SchemaPath<string>, options?: { message?: string } ): void {
  validate( path, ( { value } ) => {
    const v = value() ?? '';
    if ( v.length === 0 ) return undefined;
    const unmet = PASSWORD_CRITERIA.filter( c => !c.test( v ) ).map( c => c.key );
    if ( unmet.length === 0 ) return undefined;
    return { kind: 'passwordComplexity', unmet, ...messageOf( options ) };
  } );
}

/**
 * Requires the confirm field to repeat the password field.
 * The error `{ kind: 'passwordMismatch', message? }` is on the confirm field, and only once both
 * fields hold a value.
 */
export function passwordsMatch( password: SchemaPath<string>, confirm: SchemaPath<string>, options?: { message?: string } ): void {
  validate( confirm, ( { value, valueOf } ) => {
    const pwd = valueOf( password );
    const conf = value();
    return pwd && conf && pwd !== conf ? { kind: 'passwordMismatch', ...messageOf( options ) } : undefined;
  } );
}

// Leaves the key out rather than setting it to undefined, so the error holds only what was given.
function messageOf( options?: { message?: string } ): { message?: string } {
  return options?.message !== undefined ? { message: options.message } : {};
}
