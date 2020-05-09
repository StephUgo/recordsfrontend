import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchRequest } from '../model/searchrequest';
import { Record } from '../model/record';
import { RecordUtils } from '../recordutils';


@Component({
  selector: 'app-recordsform',
  templateUrl: './recordsform.component.html',
  styleUrls: ['./recordsform.component.css']
})
export class RecordsformComponent implements OnInit {

  public styleList: Array<{id: number, name: string, label: string}>;
  public model: any;
  public sortOptions = [
    { id: 1, name: 'Sort by Artist (asc)' },
    { id: 2, name: 'Sort by Artist (desc)' },
    { id: 3, name: 'Sort by Year (asc)' },
    { id: 4, name: 'Sort by Year (desc)' },
    { id: 5, name: 'Sort by Title (asc)' },
    { id: 6, name: 'Sort by Title (desc)' }
  ];

  public skip: number | null = null;
  public limit = 5;


  // Event emitter for searching for a new record according to the criteria filled in the form
  @Output() public searchRecordsRequested: EventEmitter<SearchRequest> = new EventEmitter<SearchRequest>();
  // Event emitter for saving a new record after its edition in the form
  @Output() public saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  // Event emitter for uploading a new cover
  @Output() public uploadCoverRequested: EventEmitter<FormData> = new EventEmitter<FormData>();
  formData: FormData | null = null;

  constructor(private recordUtils: RecordUtils) {
    this.styleList =  Object.assign([], recordUtils.getStyles());
  }

  ngOnInit() {
    this.styleList.sort((n1, n2) => {
      if (n1.name > n2.name) {
          return 1;
      }
      if (n1.name < n2.name) {
          return -1;
      }
      return 0;
    });
    this.model = {};
    this.model.myStyle = this.styleList[0];
    console.log('this.model.myStyle = ' + this.model.myStyle.name);
    this.model.mySort = this.sortOptions[0];
  }

  /**
   * Handler for record search
   */
  onClickSearch() {
    const request = new SearchRequest((this.model.myStyle.id === 0) ? null : this.model.myStyle.id,
      this.model.artiste, this.model.Titre, this.model.Format, this.model.Label,
      this.model.Country, this.model.Year, this.model.Period, this.model.mySort.id, this.limit, this.skip);
    console.log(request);
    this.searchRecordsRequested.emit(request);
  }

  /**
   * Handler for tracking style change
   */
  selectStyleChange($event: string) {
    // In my case $event come with a id value
    console.log('$event = ' + $event);
    // In my case $event come with a style object
    this.model.myStyle = $event;
  }

  /**
   * Handler for tracking sort change
   */
  selectSortChange($event: number) {
    // In my case $event come with a id value
    this.model.mySort = this.sortOptions[$event - 1];
    console.log('this.model.mySort = ' + this.model.mySort.name);
  }

  /**
   * Handler for form field reset
   */
  onClickReset() {
    this.model = {};
    this.model.myStyle = this.styleList[0];
    this.model.mySort = this.sortOptions[0];
  }

  /**
   * Handler for record saving
   */
  onClickSave() {
    if (this.model.myStyle.id === 0) {
      alert('You have to select a style to save a record.');
    } else {
      const record = new Record(this.recordUtils.getStyleNameFromStyleId(this.model.myStyle.id), this.model.artiste,
        this.model.Titre, this.model.Format, this.model.Label,
        this.model.Country, '', this.model.Period, this.model.Year);
      console.log(record);
      this.saveRecordRequested.emit(record);
    }
  }

  /**
   * Handler for cover file changed
   */
  onFileChange(coverfile: any) {
    console.log('file changed to ', coverfile);
    this.formData = new FormData();
    this.formData.append('imageupload', coverfile[0], coverfile[0]['name']);
  }

  /**
   * Handler for cover upload event (form submit)
   */
  onClickUpload() {
    if (this.formData !== null) {
      this.uploadCoverRequested.emit(this.formData);
    }
  }
}
