import {Component, OnInit, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Record } from '../model/record';
import { FormGroup, FormBuilder } from '@angular/forms';

export interface Keyword {
    keyword: string;
    position: number;
}

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'app-keywords-dialog',
  styleUrls: ['keywords-dialog.css'],
  templateUrl: 'keywords-dialog.html',
})
export class KeywordsTableDialogComponent implements OnInit {
  displayedColumns: string[] = ['position', 'keyword', 'deleteAction'];

  public keywords: Keyword[] = [];
  public versionIndex = 0;
  public record: any; // TODO use record type
  form: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<KeywordsTableDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
        this.record = data.selectedRecord;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.keywords.push({position: 1, keyword: 'Audiophile'});
    this.keywords.push({position: 2, keyword: 'Rudy Van Gelder'});
    this.keywords.push({position: 3, keyword: 'Bernie Grundman'});
    this.keywords.push({position: 4, keyword: 'RTI'});
    this.record.keywords = this.keywords;

    this.form = this.fb.group({
      newKeyword: ['', []]
    });

  }

  delete(item) {
    // your delete code
    console.log('Delete keyword ' + item.keyword);
  }
}
