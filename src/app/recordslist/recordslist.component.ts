import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { Record } from '../model/record';
import { RecordUtils } from '../recordutils';
import { MatDialog } from '@angular/material/dialog';
import { RecordDialogModalComponent } from '../record-dialog-modal/record-dialog-modal.component';
import { RecordDeletionID } from '../model/recorddeletionID';
import { environment } from '../../environments/environment';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { KeywordsTableDialogComponent } from '../keywords/keywords-dialog';


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
  @Output() public saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  // Event emitter for deleting a record after clicking in the corresponding button in the list
  @Output() public deleteRecordRequested: EventEmitter<RecordDeletionID> = new EventEmitter<RecordDeletionID>();
  // Event emitter for updating a record after its edition in the modal dialog
  @Output() public updateRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  // Event emitter for launching a new search request after a page change
  @Output() public pageChanged: EventEmitter<number> = new EventEmitter<number>();
  // Event emitter for launching a sort event
  @Output() public sortRequested: EventEmitter<[string, boolean]> = new EventEmitter<[string, boolean]>();

  public backendServerURL = environment.backendURL + ':' + environment.backendPort;

  // Sorting attributes
  public key = 'id';
  public reverse  = false;

  @ViewChild('recordMenu') recordMenu: TemplateRef<any>;

  overlayRef: OverlayRef | null;

  sub: Subscription;

  constructor(public dialog: MatDialog,
              private recordUtils: RecordUtils,
              public overlay: Overlay,
              public viewContainerRef: ViewContainerRef) { }

  ngOnInit() {

  }

  /**
   * Handler for record edition dialog
   * @param event the event
   * @param i the index of the record
   */
  public openDialog(event, i): void {

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
        console.log(this.records[i]);
        this.updateRecordRequested.emit(this.records[i]);
      }
      this.closeContextualMenu(); // If it was opened from the contextual menu
    });
  }

  public openKeywordsDialog(event, i): void {
    const dialogRef = this.dialog.open(KeywordsTableDialogComponent, {
      width: '400px',
      height: '400px',
      data: { selectedRecord: this.records[i] }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The keywords dialog was closed');
      this.closeContextualMenu(); // If it was opened from the contextual menu
    });
  }

  /**
   * Handler for record deletion button
   * @param event the event
   * @param i the index of the record
   */
  onClickDelete(event, i) {
    const recordDeletionID = this.recordUtils.getRecordDeletionID(this.records[i]);
    console.log(recordDeletionID);
    this.deleteRecordRequested.emit(recordDeletionID);
  }

  /**
   * Handler for the page changed event
   * @param newPage the page number
   */
  public onPageChanged(newPage: number): void {
    this.pageChanged.emit(newPage);
  }

  /**
   * Handler for column sorting.
   * @param key column name
   */
  public onClickSort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
    this.sortRequested.emit([key, this.reverse]);
  }

  /**
   * Update the sort options pair (key + reverse boolean) given the sort options Id
   * @param sortId SorttID
   */
  public updateSortOptionsFromSortId(sortId: number) {
    switch (sortId) {
      case 1: {
        this.key = 'artist';
        this.reverse = false;
        break;
      }
      case 2: {
        this.key = 'artist';
        this.reverse = true;
        break;
      }
      case 3: {
        this.key = 'year';
        this.reverse = false;
        break;
      }
      case 4: {
        this.key = 'year';
        this.reverse = true;
        break;
      }
      case 5: {
        this.key = 'title';
        this.reverse = false;
        break;
      }
      case 6: {
        this.key = 'title';
        this.reverse = true;
        break;
      }
      case 7: {
        this.key = 'format';
        this.reverse = false;
        break;
      }
      case 8: {
        this.key = 'format';
        this.reverse = true;
        break;
      }
      case 9: {
        this.key = 'label';
        this.reverse = false;
        break;
      }
      case 10: {
        this.key = 'label';
        this.reverse = true;
        break;
      }
      case 11: {
        this.key = 'country';
        this.reverse = false;
        break;
      }
      case 12: {
        this.key = 'country';
        this.reverse = true;
        break;
      }
      case 13: {
        this.key = 'period';
        this.reverse = false;
        break;
      }
      case 14: {
        this.key = 'period';
        this.reverse = true;
        break;
      }
    }
  }

  public openContextualMenu($event, i, record) {

    $event.preventDefault();
    let mouseEvent: MouseEvent;
    mouseEvent = $event;
    const x = mouseEvent.x;
    const y = mouseEvent.y;

    this.closeContextualMenu();

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x, y })
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    this.overlayRef.backdropClick().subscribe(() => this.closeContextualMenu());

    const wrapper = {
      item: record,
      index: i
    };

    this.overlayRef.attach(new TemplatePortal(this.recordMenu, this.viewContainerRef, {
      $implicit: wrapper
    }));
  }

  public closeContextualMenu() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
}
