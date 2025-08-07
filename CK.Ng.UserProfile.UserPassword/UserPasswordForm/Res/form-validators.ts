import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const checkPasswords = ( pathA: string, pathB: string, errorKey: string = 'mismatch' ): ValidatorFn => {
    return ( abstractControl: AbstractControl ): ValidationErrors | null => {
        const abstractControlA = abstractControl.get( pathA );
        const abstractControlB = abstractControl.get( pathB );

        if ( abstractControlA && abstractControlB ) {
            const valueA = abstractControlA.value;
            const valueB = abstractControlB.value;

            if ( valueA !== null && valueA !== undefined && valueA === valueB ) {
                abstractControlB.setErrors( null );
                return null;
            }

            const error: { [key: string]: boolean } = {};
            error[errorKey] = true;
            abstractControlB.setErrors( error );
            return error;
        }
        return null;
    };
};
