import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-comments-dialog',
  styleUrls: ['comments-dialog.css'],
  templateUrl: 'comments-dialog.html',
})
export class CommentsDialogComponent {

  public fromRecord: Record;
  public editedRecord: Record;
  form: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<CommentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromRecord = data.selectedRecord;
    this.editedRecord = Object.assign({}, this.fromRecord);
    this.form = this.fb.group({
      comments: [this.editedRecord.Comments, []]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.fromRecord.Comments = this.form.value.comments;
    this.dialogRef.close(this.fromRecord);
  }
}
