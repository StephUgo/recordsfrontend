import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Record } from '../model/Record';
import { MatDialog } from '@angular/material';
import { RecordDialogModalComponent } from '../record-dialog-modal/record-dialog-modal.component';
import { RecordPost } from '../model/recordpost';
import { RecordID } from '../model/recordID';

@Component({
  selector: 'app-recordslist',
  templateUrl: './recordslist.component.html',
  styleUrls: ['./recordslist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordslistComponent implements OnInit {

  @Input() public records: Array<Record>; // The records to display
  @Input() public style: number; // The current selected style
  @Input() public config: any; // NGxPagination configuration

  // Event emitter for saving a record after its edition in the modal dialog
  @Output() public saveRecordRequested: EventEmitter<RecordPost> = new EventEmitter<RecordPost>();
  // Event emiiter for deleting a record after clicking in the corresponding button in the list
  @Output() public deleteRecordRequested: EventEmitter<RecordID> = new EventEmitter<RecordID>();
  // Event emitter for updating a record after its edition in the modal dialog
  @Output() public updateRecordRequested: EventEmitter<RecordPost> = new EventEmitter<RecordPost>();
  // Event emitter for launching a new search request after a page change
  @Output() public pageChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() {

  }

  /**
   * Handler for record edition dialog
   * @param event the event
   * @param i the index of the record
   */
  openDialog(event, i): void {

    console.log('Open edit dialog event received : ', event);

    const dialogRef = this.dialog.open(RecordDialogModalComponent, {
      width: '400px',
      height: '600px',
      backdropClass: 'custom-dialog-backdrop-class',
      panelClass: 'custom-dialog-panel-class',
      disableClose: true,
      autoFocus: true,
      data: { selectedRecord: this.records[i] }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The edit dialog was closed', result);
      // If the dialog send a result (i.e. a record) we post it to the backend
      if (typeof result !== 'undefined') {
        this.records[i] = result;
        const postRecord = new RecordPost(this.style, this.records[i]);
        console.log(postRecord);
        this.updateRecordRequested.emit(postRecord);
      }
    });
  }

  /**
   * Handler for record deletion button
   * @param event the event
   * @param i the index of the record
   */
  onClickDelete(event, i) {
    const recordIDPost = new RecordID(this.style, this.records[i]._id);
    console.log(recordIDPost);
    this.deleteRecordRequested.emit(recordIDPost);
  }

  /**
   * Handler for the page changed event
   * @param newPage the page number
   */
  public onPageChanged(newPage: number): void {
    this.pageChanged.emit(newPage);
  }
}
