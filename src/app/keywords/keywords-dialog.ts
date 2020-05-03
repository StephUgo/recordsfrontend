import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';
import { stringify } from 'querystring';

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-keywords-dialog',
  styleUrls: ['keywords-dialog.css'],
  templateUrl: 'keywords-dialog.html',
})
export class KeywordsTableDialogComponent implements OnInit {
  displayedColumns: string[] = ['index', 'keyword', 'deleteAction'];

  public keywords: string[] = [];
  public versionIndex = 0;
  public fromRecord: Record;
  form: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<KeywordsTableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.fromRecord = data.selectedRecord;
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public ngOnInit() {
    this.keywords = Object.assign([], this.fromRecord.keywords);

    this.form = this.fb.group({
      newKeyword: ['', []]
    });

  }

  public delete(index: number) {
    console.log('Delete keyword index ' + index);
    const updatedKeywords: string [] = [];
    for (let i = 0; i < this.keywords.length; i++) {
        if (i !== index) {
          updatedKeywords.push(this.keywords[i]);
        }
    }
    this.keywords = updatedKeywords;
  }

  public addKeyword() {
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

  public close() {
    this.dialogRef.close();
  }

  public save() {
    this.fromRecord.keywords = this.keywords;
    this.dialogRef.close(this.fromRecord);
  }
}
