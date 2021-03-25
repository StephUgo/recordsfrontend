import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Studio } from '../model/studio';

@Component({
  selector: 'app-studioform',
  templateUrl: './studioform.component.html',
  styleUrls: ['./studioform.component.css']
})
export class StudioformComponent implements OnInit {

  public model: any;

  // Event emitter for saving a new studio after its edition in the form
  @Output() public saveStudioRequested: EventEmitter<Studio> = new EventEmitter<Studio>();
  // Event emitter for searching for a new studi according to the criteria filled in the form
  @Output() public searchStudiosRequested: EventEmitter<string> = new EventEmitter<string>();

  formData: FormData | null = null;

  constructor() {
  }

  ngOnInit() {
    this.model = {};
  }

  /**
   * Handler for form field reset
   */
  onClickReset() {
    this.model = {};
  }

  /**
   * Handler for studio saving
   */
  onClickSave() {
    if (this.model.name === undefined || this.model.name === '') {
      alert('You have to set a name to save a studio.');
    } else {
      const studio = new Studio(this.model.name, this.model.address, this.model.lat, this.model.lon);
      console.log(studio);
      this.saveStudioRequested.emit(studio);
    }
  }

  /**
   * Handler for studio search
   */
  onClickSearch() {
      if (this.model.name !== undefined) {
        this.searchStudiosRequested.emit(this.model.name);
      } else {
        this.searchStudiosRequested.emit('');
      }
  }
}
