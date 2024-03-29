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

    public styleList: Array<{ id: number; name: string; label: string }>;
    public formatList: Array<string>;
    public model: any;

    // Event emitter for saving a new record after its edition in the form
    @Output() public saveRecordRequested: EventEmitter<Record> = new EventEmitter<Record>();
    formData: FormData | null = null;

    lastSearchRequest: SearchRequest | null = null;
    lastDisplayedRecord: Record | null = null;

    constructor(private recordUtils: RecordUtils, private appStateService: AppSharedStateService) {
        this.styleList = Object.assign([], recordUtils.getStyles());
        this.formatList = Object.assign([], recordUtils.getFormats());
        this.appStateService.lastSearch$.subscribe(
            request => {
                this.lastSearchRequest = request;
            });
        this.appStateService.lastDisplayedRecord$.subscribe(
            record => {
                console.log('Details notification in record form : retrieved last displayed record = ' + record);
                this.lastDisplayedRecord = record;
            });
        this.lastDisplayedRecord = this.appStateService.lastDisplayedRecord.value;
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
                this.model.Country, this.model.Reference, this.model.Period, this.model.Year, this.model.ImageFileName,'',
                this.model.keywords, [], this.model.audioSamples);
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
            this.model.Reference = this.lastSearchRequest.Reference;
        } else {
            alert('You have to launch a search request first to use this operation.');
        }
    }

    /**
   * Handler for form fields set from last displayed record
   */
    onClickSetFromLastDisplayedRecord() {
        if (this.lastDisplayedRecord !== null) {
            if (this.lastDisplayedRecord.Style !== null) {
                let index = 0;
                for (const iterator of this.styleList) {
                    if (iterator.name === this.lastDisplayedRecord.Style) {
                        this.model.myStyle = this.styleList[index];
                    }
                    index++;
                }
            }
            this.model.artiste = this.lastDisplayedRecord.Artist;
            this.model.Titre = this.lastDisplayedRecord.Title;
            this.model.Format = this.lastDisplayedRecord.Format;
            this.model.Label = this.lastDisplayedRecord.Label;
            this.model.Country = this.lastDisplayedRecord.Country;
            this.model.Year = this.lastDisplayedRecord.Year;
            this.model.Period = this.lastDisplayedRecord.Period;
            this.model.Reference = this.lastDisplayedRecord.Reference;
            this.model.keywords = Object.assign([], this.lastDisplayedRecord.keywords);
            this.model.audioSamples = Object.assign([], this.lastDisplayedRecord.audioSamples);
        } else {
            alert('You have to display a record first to use this operation.');
        }
    }
}
