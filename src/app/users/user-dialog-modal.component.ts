import { Component, HostListener, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from './user.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MustMatch } from './mustmatch.validator';

@Component({
    selector: 'app-user-dialog-modal',
    templateUrl: './user-dialog-modal.component.html',
    styleUrls: ['./user-dialog-modal.component.css']
})
export class UserDialogComponent {

    form: UntypedFormGroup;
    fromUser: User;
    isLogin: boolean; // If true, we are in a User Login dialog otherwise it's a User Registration dialog
    submitted = false;

    constructor(private fb: UntypedFormBuilder, public dialogRef: MatDialogRef<UserDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        this.fromUser = data.user;
        this.isLogin = data.isLogin;
        // Init the form group with a formbuilder, we take the initial data from the user
        if (this.isLogin) {
            this.form = this.fb.group({
                name: [this.fromUser.name, Validators.required],
                email: [this.fromUser.email, [Validators.required, Validators.email]],
                password: [this.fromUser.password,  [Validators.required, Validators.minLength(6)]]
            });
        } else {
            this.form = this.fb.group({
                name: [this.fromUser.name, Validators.required],
                email: [this.fromUser.email, [Validators.required, Validators.email]],
                password: [this.fromUser.password,  [Validators.required, Validators.minLength(6)]],
                confirmpassword: ['', Validators.required]
            }, {
                validator: MustMatch('password', 'confirmpassword')
            });
        }
    }

    @HostListener('window:keyup.Enter', ['$event'])
    onDialogClick(event: KeyboardEvent): void {
        this.save();
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
        const editedUser = new User(
            this.form.value.name,
            this.form.value.email,
            this.form.value.password);
        this.dialogRef.close(editedUser);
    }
}
