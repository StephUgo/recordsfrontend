import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from './user.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MustMatch, MustNotMatch } from './mustmatch.validator';

@Component({
    selector: 'app-user-updateprofile-dialog',
    templateUrl: './updateprofile-dialog.component.html',
    styleUrls: ['./user-dialog-modal.component.css']
})
export class ProfileDialogComponent {

    form: UntypedFormGroup;
    fromUser: User;
    submitted = false;

    constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<ProfileDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        this.fromUser = data.user;
        // Init the form group with a formbuilder, we take the initial data from the user
        this.form = this.fb.group({
            name: [this.fromUser.name, Validators.required],
            email: [this.fromUser.email, [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            newpassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmpassword: ['', Validators.required]
        }, {
            validator: () => {
                MustNotMatch('password', 'newpassword')(this.form);
                MustMatch('newpassword', 'confirmpassword')(this.form);
            }
        });
    }

    get f() {
        return this.form.controls;
    }

    close() {
        this.dialogRef.close();
    }

    save() {
        this.submitted = true;
        if (this.form.invalid) {
            return;
        }
        //  - Check old password
        if (this.form.value.password !== this.fromUser.password) {
            alert('The current password doesn\'t match.');
        } else {
            //  - Check new password & confirmed password
            if (this.form.value.newpassword !== this.form.value.confirmpassword) {
                alert('The new password and confirmed password fields don\'t match.');
            } else {
                this.dialogRef.close(this.form.value.newpassword);
            }
        }
    }
}
