import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppSharedStateService } from '../app.sharedstateservice';
import { Record } from '../model/record';
import { SearchRequest } from '../model/searchrequest';
import { RecordUtils } from '../recordutils';


@Component({
  selector: 'app-recordsform',
  templateUrl: './recordsform.component.html',
  styleUrls: ['./recordsform.component.css']
})
export class RecordsformComponent implements OnInit {

  public styleList: Array<{id: number, name: string, label: string}>;
  public model: any;

  // Event emitter for saving a new record after its edition in the form
  @Output() public saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
  formData: FormData | null = null;

  lastSearchRequest: SearchRequest | null = null;

  constructor(private recordUtils: RecordUtils, private appStateService: AppSharedStateService) {
    this.styleList =  Object.assign([], recordUtils.getStyles());
    this.appStateService.lastSearch$.subscribe(
      request => {
        this.lastSearchRequest = request;
      });
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
   * Handler for form field reset
   */
  onClickReset() {
    this.model = {};
    this.model.myStyle = this.styleList[0];
  }

  /**
   * Handler for record saving
   */
  onClickSave() {
    if (this.model.myStyle.id === 0) {
      alert('You have to select a style to save a record.');
    } else if (this.model.myStyle.name === 'Audiophile') {
      alert('Please select another style, "Audiophile" is just a shortcut...');
    } else {
      const record = new Record(this.recordUtils.getStyleNameFromStyleId(this.model.myStyle.id), this.model.artiste,
        this.model.Titre, this.model.Format, this.model.Label,
        this.model.Country, '', this.model.Period, this.model.Year);
      console.log(record);
      this.saveRecordRequested.emit(record);
    }
  }

  /**
   * Handler for form fields set from last Search request
   */
  onClickSetFromLastSearch() {
    if (this.lastSearchRequest !== null) {
      if (this.lastSearchRequest.Style !== null) {
        let index = 0;
        for (const iterator of this.styleList) {
          if (iterator.id === this.lastSearchRequest.Style) {
            this.model.myStyle = this.styleList[index];
          }
          index++;
        }
      }
      this.model.artiste = this.lastSearchRequest.Artiste;
      this.model.Titre = this.lastSearchRequest.Titre;
      this.model.Format = this.lastSearchRequest.Format;
      this.model.Label = this.lastSearchRequest.Label;
      this.model.Country = this.lastSearchRequest.Country;
      this.model.Year = this.lastSearchRequest.Year;
      this.model.Period = this.lastSearchRequest.Period;
    }
  }
}
