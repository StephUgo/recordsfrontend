import { Component, OnInit } from '@angular/core';
import { Record } from '../model/record';
import { AppSharedStateService } from '../app.sharedstateservice';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recorddetails',
  templateUrl: './recorddetails.component.html',
  styleUrls: ['./recorddetails.component.css']
})
export class RecordDetailsComponent implements OnInit {

  records: Array<Record> = []; // The records to display
  record: Record | null = null; // The record to display
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.

  constructor(private route: ActivatedRoute, private appStateService: AppSharedStateService) {
    this.subscription = this.appStateService.setRecords$.subscribe(
      records => {
        console.log('Details notification : records = ' +  records);
        this.records = records;
      });
      this.records = this.appStateService.records.value;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      if (params !== null) {
        const indexAsString = params.get('recordId');
        console.log('indexAsString = ' +  indexAsString);
        if (indexAsString !== null) {
          const index = +indexAsString;
          this.record = this.records[index];
        }
      }
    });
  }
}
