import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-record-dialog-modal',
  templateUrl: './record-dialog-modal.component.html',
  styleUrls: ['./record-dialog-modal.component.css']
})
export class RecordDialogModalComponent {

  form: FormGroup;
  fromPage: Record; // The record to edit coming from the RecordListComponent

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<RecordDialogModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {

    this.fromPage = data.selectedRecord;

    // TODO : fix or generalize to other fields
    if (typeof data.selectedRecord.Reference === 'number') {
      this.fromPage.Reference = String(data.selectedRecord.Reference);
    }

    // Init the form group with a formbuilder, we take the initial data from the record
    // selected in the record list (nb : we dont edit the id of course...)
    this.form = this.fb.group({
      artist: [(this.fromPage.Artist) ? this.fromPage.Artist.trim() : '', []],
      title: [(this.fromPage.Title) ? this.fromPage.Title.trim() : '', []],
      format: [(this.fromPage.Format) ? this.fromPage.Format.trim() : '', []],
      label: [(this.fromPage.Label) ? this.fromPage.Label.trim() : '', []],
      country: [(this.fromPage.Country) ? this.fromPage.Country.trim() : '', []],
      reference: [(this.fromPage.Reference) ? this.fromPage.Reference.trim() : '', []],
      period: [(this.fromPage.Period) ? this.fromPage.Period.trim() : '', []],
      year: [this.fromPage.Year, []],
      imageFileName: [this.fromPage.ImageFileName, []]
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    const editedRecord = new Record(
      this.fromPage.Style, // Style isn't editable for the moment
      this.form.value.artist.trim(),
      this.form.value.title.trim(),
      this.form.value.format.trim(),
      this.form.value.label.trim(),
      this.form.value.country.trim(),
      this.form.value.reference.trim(),
      this.form.value.period.trim(),
      this.form.value.year,
      this.form.value.imageFileName,
      this.fromPage.Comments,
      this.fromPage.keywords // Keywords are editable from a specific dialoog
      );
      editedRecord._id = this.fromPage._id;
      this.dialogRef.close(editedRecord);
  }
}
