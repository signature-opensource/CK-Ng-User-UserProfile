import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UserPasswordValidator {
    static strongPassword(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const password = control.value;
            const errors: { [key: string]: boolean } = {};

            if (password.length < minLength) {
                errors['minLength'] = true;
            }

            if (!/[A-Z]/.test(password)) {
                errors['uppercase'] = true;
            }

            if (!/[a-z]/.test(password)) {
                errors['lowercase'] = true;
            }

            if (!/[0-9]/.test(password)) {
                errors['number'] = true;
            }

            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors['special'] = true;
            }

            return Object.keys(errors).length ? { strongPassword: errors } : null;
        };
    }
}
