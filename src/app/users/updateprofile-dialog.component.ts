import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from './user.model';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user-updateprofile-dialog',
  templateUrl: './updateprofile-dialog.component.html',
  styleUrls: ['./user-dialog-modal.component.css']
})
export class ProfileDialogComponent {

  form: FormGroup;
  fromUser: User;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<ProfileDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromUser = data.user;
    // Init the form group with a formbuilder, we take the initial data from the user
    this.form = this.fb.group({
      name: [this.fromUser.name, []],
      email: [this.fromUser.email, []],
      password: ['', []],
      newpassword: ['', []],
      confirmpassword: ['', []]
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
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
