import { AbstractControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';

// Custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
        if (formGroup === undefined) {
            return;
        }

        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}

// Custom validator to check that a fields matches a given string value
export function MustMatchAString(stringValue: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        // set error on matchingControl if validation fails
        if (stringValue !== control.value) {
            return { mustMatch: true };
        } else {
            return null;
        }
    };
}

// Custom validator to check that two fields do not match
export function MustNotMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
        if (formGroup === undefined) {
            return;
        }

        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value === matchingControl.value) {
            matchingControl.setErrors({ mustNotMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}
