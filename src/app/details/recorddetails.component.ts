import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Record } from '../model/record';
import { AppSharedStateService } from '../app.sharedstateservice';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { RecordUtils } from '../recordutils';
import { CoverViewOverlayService } from '../coverview/coverview.service';
import { MatDialog } from '@angular/material/dialog';
import { RecordDialogModalComponent } from '../record-dialog-modal/record-dialog-modal.component';
import { StringListDialogComponent, StringListDialogFlavor, StringListDialogData } from '../stringlistedit/stringlist-dialog';
import { CommentsDialogComponent } from '../comments/comments-dialog';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-recorddetails',
  templateUrl: './recorddetails.component.html',
  styleUrls: ['./recorddetails.component.css']
})
export class RecordDetailsComponent implements OnInit {

  records: Array<Record> = []; // The records retrieved from last search
  record: Record | null = null; // The record to display
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.
  backendServerURL = environment.backendURL + ':' + environment.backendPort;
  tracklist: string | null = null;
  companies: string | null = null;
  credits: string | null = null;
  notes: string | null = null;
  // Event emitter for updating a record after its edition in the modal dialog
  @Output() updateRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();

  constructor(public dialog: MatDialog, public recordUtils: RecordUtils, public coverViewService: CoverViewOverlayService,
    private route: ActivatedRoute, private appStateService: AppSharedStateService, private sanitizer: DomSanitizer) {
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
            this.appStateService.setLastDisplayedRecord(foundRecord);
          }
        }
      }
    });
  }

  parseComments() {
    this.tracklist = '';
    this.companies = '';
    this.credits = '';
    this.notes = '';
    if ((this.record !== null) && (this.record.Comments !== undefined) && (this.record.Comments !== null)) {
      let comments = this.record.Comments.trim();
      const indexOfCompanies = comments.indexOf('Companies, etc.');
      if (indexOfCompanies !== -1) {
        this.tracklist = comments.substring(9, indexOfCompanies);
        const indexOfCredits = comments.indexOf('Credits');
        if (indexOfCredits > indexOfCompanies) {
          this.companies = comments.substring(indexOfCompanies + 15, indexOfCredits);
        }
        const indexOfNotes = comments.lastIndexOf('Notes');
        if (indexOfNotes > indexOfCredits) {
          this.credits = comments.substring(indexOfCredits + 7, indexOfNotes);
          this.notes = comments.substring(indexOfNotes + 5);
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

  /**
   * RECORD EDITION dialog handler
   * @param event the event
   */
  openRecordEditionDialog(event: any): void {

    console.log('Open edit dialog event received : ', event);

    if (this.record !== null) {
      const dialogRef = this.dialog.open(RecordDialogModalComponent, {
        width: '400px',
        height: '600px',
        backdropClass: 'custom-dialog-backdrop-class',
        panelClass: 'custom-dialog-panel-class',
        disableClose: true,
        autoFocus: true,
        data: { selectedRecord: this.record }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The edit dialog was closed', result);
        // If the dialog send a result (i.e. a record) we post it to the backend
        if (typeof result !== typeof undefined) {
          this.record = result;
          console.log(this.record);
          this.updateRecordRequested.emit(result);
        }
      });
    }
  }


  /**
   * STRING LIST EDITION dialog open handler
   * @param event the event
   * @param flavor the "kind" of  string elements in the list
   */
  openStringListDialog(event: any, flavor: StringListDialogFlavor): void {

    if (this.record !== null) {

      const dialogInputData: StringListDialogData = { selectedRecord: this.record, isAddOnly: false,
         dialogFlavor: flavor };

      const dialogRef = this.dialog.open(StringListDialogComponent, {
        width: '400px',
        height: '500px',
        data: dialogInputData
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The string list edition dialog was closed');
        // If the dialog send a result (i.e. a record) we post it to the backend
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          this.record = result;
          console.log(this.records);
          this.updateRecordRequested.emit(result);
        }
      });
    }
  }

  /**
   * COMMENTS EDITION DIALOG open handler
   * @param event the event
   */
  openCommentsDialog(event: any): void {

    console.log('Open edit comments dialog event received : ', event);

    if (this.records !== null) {
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '400px',
        height: '600px',
        data: { selectedRecord: this.record }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The edit comments dialog was closed', result);
        // If the dialog send a result (i.e. a record) we post it to the backend
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          this.record = result;
          console.log(this.record);
          this.updateRecordRequested.emit(result);
        }
      });
    }
  }

  sanitizeYoutubeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
