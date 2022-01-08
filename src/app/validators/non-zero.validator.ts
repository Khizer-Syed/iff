import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nonZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const valid = control.value > 0;
        return valid ? null : { invalid: { value: control.value } };
    };
}
