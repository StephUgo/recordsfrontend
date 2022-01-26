import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchRequest } from '../model/searchrequest';
import { RecordUtils } from '../recordutils';


@Component({
    selector: 'app-searchform',
    templateUrl: './searchform.component.html',
    styleUrls: ['./searchform.component.css']
})
export class SearchFormComponent implements OnInit {

    public styleList: Array<{id: number, name: string, label: string}>;
    public formatList: Array<string>;
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
    formData: FormData | null = null;

    constructor(private recordUtils: RecordUtils) {
        this.styleList =  Object.assign([], this.recordUtils.getStyles());
        this.formatList = Object.assign([], recordUtils.getFormats());
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
            this.model.Country, this.model.Year, this.model.Period, this.model.Reference, this.model.Keywords,
            this.model.mySort.id, this.limit, this.skip);
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
}
