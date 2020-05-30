import { Component, OnInit } from '@angular/core';
import { Record } from '../model/record';
import { AppSharedStateService } from '../app.sharedstateservice';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RecordUtils } from '../recordutils';

@Component({
  selector: 'app-recorddetails',
  templateUrl: './recorddetails.component.html',
  styleUrls: ['./recorddetails.component.css']
})
export class RecordDetailsComponent implements OnInit {

  records: Array<Record> = []; // The records to display
  record: Record | null = null; // The record to display
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.
  backendServerURL = environment.backendURL + ':' + environment.backendPort;

  constructor(public recordUtils: RecordUtils, private route: ActivatedRoute, private appStateService: AppSharedStateService) {
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
        const recordId = params.get('recordId');
        if (recordId !== null) {
          const foundRecord = this.records.find(record => record._id === recordId);
          if (foundRecord !== undefined) {
            this.record = foundRecord;
          }
        }
      }
    });
  }
}
