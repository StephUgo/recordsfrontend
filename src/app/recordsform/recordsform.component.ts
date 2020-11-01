import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

  // Event emitter for saving a new record after its edition in the form
  @Output() public saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
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
}
