import { Component, Inject, Optional, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-record-dialog-modal',
  templateUrl: './record-dialog-modal.component.html',
  styleUrls: ['./record-dialog-modal.component.css']
})
export class RecordDialogModalComponent implements OnInit {

  form: FormGroup;
  fromPage: Record; // The record to edit coming from the RecordListComponent

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<RecordDialogModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromPage = data.selectedRecord;
  }

  ngOnInit() {
    // Init the form group with a formbuilder, we take the initial data from the record
    // selected in the record list (nb : we dont edit the id of course...)
    this.form = this.fb.group({
      artist: [this.fromPage.Artist, []],
      title: [this.fromPage.Title, []],
      format: [this.fromPage.Format, []],
      label: [this.fromPage.Label, []],
      country: [this.fromPage.Country, []],
      reference: [this.fromPage.Reference, []],
      period: [this.fromPage.Period, []],
      year: [this.fromPage.Year, []],
      imageFileName: [this.fromPage.ImageFileName, []],
      comments: [this.fromPage.Comments, []]
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    const editedRecord = new Record(
      this.fromPage.Style, // Style isn't editable for the moment
      this.form.value.artist,
      this.form.value.title,
      this.form.value.format,
      this.form.value.label,
      this.form.value.country,
      this.form.value.reference,
      this.form.value.period,
      this.form.value.year,
      this.form.value.imageFileName,
      this.form.value.comments);
      editedRecord._id = this.fromPage._id;
      this.dialogRef.close(editedRecord);
  }
}
