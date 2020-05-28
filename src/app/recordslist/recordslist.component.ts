import {
  Component, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, TemplateRef, ViewContainerRef,
  OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';
import { Record } from '../model/record';
import { RecordUtils } from '../recordutils';
import { MatDialog } from '@angular/material/dialog';
import { RecordDialogModalComponent } from '../record-dialog-modal/record-dialog-modal.component';
import { RecordDeletionID } from '../model/recorddeletionID';
import { environment } from '../../environments/environment';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { KeywordsTableDialogComponent } from '../keywords/keywords-dialog';
import { CommentsDialogComponent } from '../comments/comments-dialog';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recordslist',
  templateUrl: './recordslist.component.html',
  styleUrls: ['./recordslist.component.css']
})
export class RecordslistComponent implements OnChanges, OnDestroy {

  records: Array<Record> | null = null; // The records to display
  style: number | null = null; // The current selected style
  config: any; // NGxPagination configuration
  subscription: Subscription; // Subscription used to get all the previous fields from the AppSharedStateService observables.

  // Event emitter for saving a record after its edition in the modal dialog
  @Output() saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  // Event emitter for deleting a record after clicking in the corresponding button in the list
  @Output() deleteRecordRequested: EventEmitter<RecordDeletionID> = new EventEmitter<RecordDeletionID>();
  // Event emitter for updating a record after its edition in the modal dialog
  @Output() updateRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  // Event emitter for adding keywords to a list of records
  @Output() addKeywordsRequested: EventEmitter<Record[]> = new EventEmitter<Record[]>();
  // Event emitter for launching a new search request after a page change
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();
  // Event emitter for launching a sort event
  @Output() sortRequested: EventEmitter<[string, boolean]> = new EventEmitter<[string, boolean]>();

  backendServerURL = environment.backendURL + ':' + environment.backendPort;

  // Sorting attributes
  key = 'id';
  reverse = false;

  @ViewChild('recordMenu') recordMenu: TemplateRef<any> | null = null;

  overlayRef: OverlayRef | null = null;

  private checkedItems: number[] = [];

  isDisplayCoverList = true;
  isSelectAll = false;

  constructor(public dialog: MatDialog,
    private recordUtils: RecordUtils,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    private appStateService: AppSharedStateService) {
    this.subscription = this.appStateService.setRecords$.subscribe(
      records => {
        this.records = records;
      });
    this.subscription.add(this.appStateService.setConfig$.subscribe(
      config => {
        this.config = config;
      }));
    this.subscription.add(this.appStateService.setCurrentStyle$.subscribe(
      style => {
        this.style = style;
      }));
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

  /**
   * Handler for record edition dialog
   * @param event the event
   * @param i the index of the record
   */
  openDialog(event: any, i: number): void {

    console.log('Open edit dialog event received : ', event);
    this.closeContextualMenu(); // If it was opened from the contextual menu

    if (i === -1 && (this.multiSelectionIsAvoided() || this.isSelectionEmpty())) {
      return;
    }
    if (i === -1) {
      i = this.getFirstCheckedIndex();
    }

    if ((this.records !== null) && (i >= 0) && (i < this.records.length)) {
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
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          this.records[i] = result;
          console.log(this.records[i]);
          this.updateRecordRequested.emit(this.records[i]);
        }
      });
    }
  }

  /**
   * Handler for comments edition dialog
   * @param event the event
   * @param i the index of the record
   */
  openCommentsDialog(event: any, i: number): void {

    console.log('Open edit comments dialog event received : ', event);
    this.closeContextualMenu(); // If it was opened from the contextual menu

    if (i === -1 && (this.multiSelectionIsAvoided() || this.isSelectionEmpty())) {
      return;
    }
    if (i === -1) {
      i = this.getFirstCheckedIndex();
    }

    if ((this.records !== null) && (i >= 0) && (i < this.records.length)) {
      const dialogRef = this.dialog.open(CommentsDialogComponent, {
        width: '400px',
        height: '600px',
        data: { selectedRecord: this.records[i] }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The edit comments dialog was closed', result);
        // If the dialog send a result (i.e. a record) we post it to the backend
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          this.records[i] = result;
          console.log(this.records[i]);
          this.updateRecordRequested.emit(this.records[i]);
        }
      });
    }
  }

  /**
   * Handler for keywords edition dialog
   * @param event the event
   * @param i the index of the record
   */
  openKeywordsDialog(event: any, i: number): void {
    this.closeContextualMenu(); // If it was opened from the contextual menu

    if ((this.records !== null) && (i >= 0) && (i < this.records.length)) {
      const dialogRef = this.dialog.open(KeywordsTableDialogComponent, {
        width: '400px',
        height: '500px',
        data: { selectedRecord: this.records[i], isAddKeywordsOnly: false }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The keywords dialog was closed');
        // If the dialog send a result (i.e. a record) we post it to the backend
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          this.records[i] = result;
          console.log(this.records[i]);
          this.updateRecordRequested.emit(this.records[i]);
        }
      });
    }
  }

  /**
   * Handler for adding keywords to one or several records
   * @param event the event
   */
  addKeywordsDialog(event: any): void {
    this.closeContextualMenu(); // If it was opened from the contextual menu

    if (this.isSelectionEmpty()) {
      return;
    }

    let record = new Record('', '', '', '', '', '', '', '', 0);

    if (this.records !== null) {
      const dialogRef = this.dialog.open(KeywordsTableDialogComponent, {
        width: '400px',
        height: '500px',
        data: { selectedRecord: record, isAddKeywordsOnly: true }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The keywords dialog was closed');
        // If the dialog send a result (i.e. a record) we post it to the backend
        if ((typeof result !== typeof undefined) && (this.records !== null)) {
          record = result;
          console.log(record);
          if (record.keywords !== undefined && record.keywords.length > 0) {
            const editedRecords: Record[] = [];
            for (let index = 0; index < this.checkedItems.length; index++) {
              const selectedIndex = this.checkedItems[index];
              if (selectedIndex !== undefined) {
                editedRecords.push(this.records[selectedIndex]);
              }
            }
            for (let index = 0; index < editedRecords.length; index++) {
              const selectedRecord = editedRecords[index];
              if (typeof selectedRecord.keywords === typeof undefined) {
                selectedRecord.keywords = Object.assign([], record.keywords);
              } else {
                selectedRecord.keywords = selectedRecord.keywords?.concat(record.keywords);
              }
            }
            console.log(editedRecords);
            this.addKeywordsRequested.emit(editedRecords);
          }
        }
      });
    }
  }

  /**
   * Handler for record deletion button
   * @param event the event
   * @param i the index of the record
   */
  onClickDelete(event: any, i: number) {
    if (i === -1 && (this.multiSelectionIsAvoided() || this.isSelectionEmpty())) {
      return;
    }
    if (i === -1) {
      i = this.getFirstCheckedIndex();
    }

    if ((this.records !== null) && (i >= 0) && (i < this.records.length)) {
      if (confirm('Please confirm the deletion of the record ' + (this.records[i].Title !== undefined ? this.records[i].Title : ''))) {
        const recordDeletionID = this.recordUtils.getRecordDeletionID(this.records[i]);
        console.log(recordDeletionID);
        this.deleteRecordRequested.emit(recordDeletionID);
      }
    }

  }

  /**
   * Handler for the page changed event
   * @param newPage the page number
   */
  onPageChanged(newPage: number): void {
    this.pageChanged.emit(newPage);
  }

  /**
   * Handler for column sorting.
   * @param key column name
   */
  onClickSort(key: string) {
    this.key = key;
    this.reverse = !this.reverse;
    this.sortRequested.emit([key, this.reverse]);
  }

  /**
   * Update the sort options pair (key + reverse boolean) given the sort options Id
   * @param sortId SorttID
   */
  updateSortOptionsFromSortId(sortId: number) {
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

  /**
   * Handler for checkbox checks.
   * @param event DOM event
   * @param i index of the checkbox which has changed
   */
  onCheckChanged(event: any, i: number) {
    if (event.target.checked) {
      for (let index = 0; index < this.checkedItems.length; index++) {
        const element = this.checkedItems[index];
        if (element === undefined) {
          this.checkedItems[index] = i;
          console.log(this.checkedItems);
          return;
        }
      }
      this.checkedItems.push(i);
    } else {
      for (let index = 0; index < this.checkedItems.length; index++) {
        const element = this.checkedItems[index];
        if (element === i) {
          delete this.checkedItems[index];
          console.log(this.checkedItems);
          return;
        }
      }
    }
  }

  getKeywordsCellContents(record: Record): string {
    let keywords = '';
    if ((record.keywords !== undefined) && (record.keywords !== null)) {
      for (let index = 0; index < record.keywords.length; index++) {
        if (index === 0) {
          keywords = 'Keywords: ';
        }
        const element = record.keywords[index];
        keywords += element;
        if (index === record.keywords.length - 1) {
          keywords += '.';
        } else {
          keywords += ', ';
        }
      }
    }
    return keywords;
  }

  getCommentsCellContents(record: Record): string {
    if ((record.Comments !== undefined) && (record.Comments !== null)) {
      if (record.Comments.length <= 200) {
        return record.Comments;
      } else {
        return record.Comments.substring(0, 197) + '...';
      }
    }
    return '';
  }

  openContextualMenu(event: any, i: number, record: Record) {

    event.preventDefault();
    let mouseEvent: MouseEvent;
    mouseEvent = event;
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

    if (this.recordMenu !== null) {
      this.overlayRef.attach(new TemplatePortal(this.recordMenu, this.viewContainerRef, {
        $implicit: wrapper
      }));
    }

  }

  closeContextualMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.records) {
      this.checkedItems = [];
    }
  }

  setDisplayCoverList(value: boolean) {
    this.isDisplayCoverList = value;
  }

  private multiSelectionIsAvoided(): boolean {
    if (this.isMultiSelection()) {
      alert('Multi selection isn\'t supported for this operation.');
      return true;
    }
    return false;
  }

  private isMultiSelection(): boolean {
    let numberOfCheckedItems = 0;
    for (let index = 0; index < this.checkedItems.length; index++) {
      const element = this.checkedItems[index];
      if (element !== undefined) {
        numberOfCheckedItems++;
      }
    }
    return numberOfCheckedItems > 1;
  }

  private isSelectionEmpty(): boolean {
    for (let index = 0; index < this.checkedItems.length; index++) {
      const element = this.checkedItems[index];
      if (element !== undefined) {
        return false;
      }
    }
    return true;
  }

  private getFirstCheckedIndex(): number {
    for (let index = 0; index < this.checkedItems.length; index++) {
      const element = this.checkedItems[index];
      if (element !== undefined) {
        return element;
      }
    }
    return -1;
  }

  public isRecordSelected(indexToCheck: number): boolean {
    for (let index = 0; index < this.checkedItems.length; index++) {
      const element = this.checkedItems[index];
      if (element === indexToCheck) {
        return true;
      }
    }
    return false;
  }

  public onChangeSelectAllCheckbox() {
    this.isSelectAll = !this.isSelectAll;
    if (this.isSelectAll && this.records !== null) {
      const allSelectionArray = [];
      for (let index = 0; index < this.records.length; index++) {
        allSelectionArray.push(index);
      }
      this.checkedItems = allSelectionArray;
    } else {
      this.checkedItems = [];
    }
  }
}
