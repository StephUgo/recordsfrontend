import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Studio } from '../model/studio';
import { Record } from '../model/record';
import { AppSharedStateService } from '../app.sharedstateservice';

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
    lastDisplayedRecord: Record | null = null;
    index = 0;

    constructor(private appStateService: AppSharedStateService) {
        this.appStateService.lastDisplayedRecord$.subscribe(
            record => {
                this.lastDisplayedRecord = record;
            });
        this.lastDisplayedRecord = this.appStateService.lastDisplayedRecord.value;
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

    /**
   * Handler for form fields set from last displayed record
   */
    onClickSetFromLastDisplayedRecord() {
        if (this.lastDisplayedRecord !== null && this.lastDisplayedRecord.keywords !== undefined) {
            const currentStudios = this.lastDisplayedRecord.keywords.filter(s => s.startsWith('Recorded @'))
                .map(s => JSON.parse(s.substring(10)));
            if (currentStudios.length > 0) {
                const currentStudio: Studio = currentStudios[this.index];
                this.model.name = currentStudio.name;
                this.model.lat = currentStudio.lat;
                this.model.lon = currentStudio.lon;
            }
        } else {
            alert('You have to display a record first to use this operation.');
        }
    }
}
