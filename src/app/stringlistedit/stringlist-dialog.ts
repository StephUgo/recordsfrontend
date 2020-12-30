import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

export enum StringListDialogFlavor {
  Keywords  = 0,
  AdditionalPics = 1,
  Samples = 2
}

export interface StringListDialogData {
  selectedRecord: Record;
  isAddOnly: boolean;
  dialogFlavor: StringListDialogFlavor;
}

@Component({
  selector: 'app-stringlist-dialog',
  styleUrls: ['stringlist-dialog.css'],
  templateUrl: 'stringlist-dialog.html',
})
export class StringListDialogComponent {
  displayedColumns: string[] = ['index', 'value', 'deleteAction'];

  values: string[] = [];
  fromRecord: Record;
  form: FormGroup;
  isAddOnlyDialog = false;
  dialogFlavor = StringListDialogFlavor.Keywords;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<StringListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromRecord = data.selectedRecord;
    this.isAddOnlyDialog = data.isAddOnly;
    if (data.dialogFlavor !== undefined && data.dialogFlavor !== null) {
      this.dialogFlavor = data.dialogFlavor;
    }

    switch  (this.dialogFlavor) {
      case StringListDialogFlavor.Keywords :
        this.values = Object.assign([], this.fromRecord.keywords);
        break;
      case StringListDialogFlavor.AdditionalPics :
        this.values = Object.assign([], this.fromRecord.additionalPics);
        break;
      case StringListDialogFlavor.Samples :
        this.values = Object.assign([], this.fromRecord.audioSamples);
        break;
    }

    this.form = this.fb.group({
      newValue: ['', []]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  delete(index: number) {
    console.log('Delete value with index ' + index);
    const updatedValues: string[] = [];
    for (let i = 0; i < this.values.length; i++) {
      if (i !== index) {
        updatedValues.push(this.values[i]);
      }
    }
    this.values = updatedValues;
  }

  add() {
    if (this.form.value.newValue !== null) {
      let value: string;
      value = this.form.value.newValue as string;
      if (value.length > 0) {
        let newValues: string[];
        newValues = Object.assign([], this.values);
        if (value.indexOf('\\')) {
          let valuesToBeAdded: string[];
          valuesToBeAdded = value.split('\\');
          Array.prototype.push.apply(newValues, valuesToBeAdded);
        } else {
          newValues.push(value);
        }
        this.values = newValues;
      }
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    switch  (this.dialogFlavor) {
      case StringListDialogFlavor.Keywords :
        this.fromRecord.keywords = this.values;
        break;
      case StringListDialogFlavor.AdditionalPics :
        this.fromRecord.additionalPics = this.values;
        break;
      case StringListDialogFlavor.Samples :
        this.fromRecord.audioSamples = this.values;
        break;
    }

    this.dialogRef.close(this.fromRecord);
  }

  getElementLabel() {
    switch  (this.dialogFlavor) {
      case StringListDialogFlavor.Keywords :
        return 'keyword';
      case StringListDialogFlavor.AdditionalPics :
        return 'additional picture';
      case StringListDialogFlavor.Samples :
        return 'audio sample';
    }
  }

  capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
