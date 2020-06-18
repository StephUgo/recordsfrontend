import { Component, OnInit } from '@angular/core';
import { Record } from '../model/record';
import { AppSharedStateService } from '../app.sharedstateservice';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecordUtils } from '../recordutils';
import { CoverViewOverlayService } from '../coverview/coverview.service';

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
  tracklist: string | null = null;
  companies: string | null = null;
  credits: string | null = null;
  notes: string | null = null;

  constructor(public recordUtils: RecordUtils, public coverViewService: CoverViewOverlayService,
    private route: ActivatedRoute, private appStateService: AppSharedStateService) {
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
            this.parseComments();
          }
        }
      }
    });
  }

  parseComments() {
    this.tracklist = null;
    this.companies = null;
    this.credits = null;
    this.notes = null;
    if ((this.record !== null) && (this.record.Comments !== undefined) && (this.record.Comments !== null)) {
      const indexOfCompanies = this.record.Comments.indexOf('Companies, etc.');
      if (indexOfCompanies !== -1) {
        this.tracklist = this.record.Comments.substring(0, indexOfCompanies);
        const indexOfCredits = this.record.Comments.indexOf('Credits');
        if (indexOfCredits > indexOfCompanies) {
          this.companies = this.record.Comments.substring(indexOfCompanies, indexOfCredits);
        }
        const indexOfNotes = this.record.Comments.lastIndexOf('Notes');
        if (indexOfNotes > indexOfCredits) {
          this.credits = this.record.Comments.substring(indexOfCredits, indexOfNotes);
          this.notes = this.record.Comments.substring(indexOfNotes);
        }
      }
    }
  }

  displayCover() {
    // Returns a handle to the open overlay
    this.coverViewService.open({
      record: this.record
    });
  }
}
