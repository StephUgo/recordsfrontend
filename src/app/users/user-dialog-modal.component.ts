import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from './user.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user-dialog-modal',
  templateUrl: './user-dialog-modal.component.html',
  styleUrls: ['./user-dialog-modal.component.css']
})
export class UserDialogComponent {

  form: FormGroup;
  fromUser: User;
  isLogin: boolean; // If true, we are in a User Login dialog otherwise it's a User Registration dialog.

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<UserDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromUser = data.user;
    this.isLogin = data.isLogin;
    // Init the form group with a formbuilder, we take the initial data from the user
    this.form = this.fb.group({
      name: [this.fromUser.name, []],
      email: [this.fromUser.email, []],
      password: [this.fromUser.password, []]
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    const editedUser = new User(
      this.form.value.name,
      this.form.value.email,
      this.form.value.password);
    this.dialogRef.close(editedUser);
  }
}
