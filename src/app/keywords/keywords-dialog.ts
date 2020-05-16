import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-keywords-dialog',
  styleUrls: ['keywords-dialog.css'],
  templateUrl: 'keywords-dialog.html',
})
export class KeywordsTableDialogComponent {
  displayedColumns: string[] = ['index', 'keyword', 'deleteAction'];

  public keywords: string[] = [];
  public versionIndex = 0;
  public fromRecord: Record;
  form: FormGroup;
  public isAddOnlyKeywordsDialog = false;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<KeywordsTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromRecord = data.selectedRecord;
    this.isAddOnlyKeywordsDialog = data.isAddKeywordsOnly;
    this.keywords = Object.assign([], this.fromRecord.keywords);
    this.form = this.fb.group({
      newKeyword: ['', []]
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  delete(index: number) {
    console.log('Delete keyword index ' + index);
    const updatedKeywords: string [] = [];
    for (let i = 0; i < this.keywords.length; i++) {
        if (i !== index) {
          updatedKeywords.push(this.keywords[i]);
        }
    }
    this.keywords = updatedKeywords;
  }

  addKeyword() {
    if (this.form.value.newKeyword !== null) {
      let keyword: string;
      keyword = this.form.value.newKeyword as string;
      if (keyword.length > 0) {
        let newKeywords: string[];
        newKeywords = Object.assign([], this.keywords);
        newKeywords.push(keyword);
        this.keywords = newKeywords;
      }
    }
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.fromRecord.keywords = this.keywords;
    this.dialogRef.close(this.fromRecord);
  }
}
