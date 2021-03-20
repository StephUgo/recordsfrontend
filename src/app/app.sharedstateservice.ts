import { Injectable } from '@angular/core';
import { Record } from './model/record';
import { Studio } from './model/studio';
import { BehaviorSubject } from 'rxjs';
import { SearchRequest } from './model/searchrequest';

@Injectable({
    providedIn: 'root'
})
export class AppSharedStateService {

    records = new BehaviorSubject<Array<Record>>([]); // The current displayed list of records
    currentStyle = new BehaviorSubject<number>(0); // The current selected style (TODO : remove ?)
    lastSearch = new BehaviorSubject<SearchRequest|null>(null);
    lastDisplayedRecord = new BehaviorSubject<Record|null>(null);
    config = new BehaviorSubject<any>({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0
    }); // NGxPagination configuration
    activeForm = new BehaviorSubject<boolean>(false);
    activeSearchForm = new BehaviorSubject<boolean>(false);
    activeUploadForm = new BehaviorSubject<boolean>(false);
    studios = new BehaviorSubject<Array<Studio>>([]); // The current displayed list of studios

    // Observable streams
    setRecords$ = this.records.asObservable();
    setCurrentStyle$ = this.currentStyle.asObservable();
    setConfig$ = this.config.asObservable();
    setActiveForm$ = this.activeForm.asObservable();
    setActiveSearchForm$ = this.activeSearchForm.asObservable();
    setActiveUploadForm$ = this.activeUploadForm.asObservable();
    lastSearch$ = this.lastSearch.asObservable();
    lastDisplayedRecord$ = this.lastDisplayedRecord.asObservable();
    setStudios$ = this.studios.asObservable();

    // Service message commands
    setRecords(newRecords: Array<Record>) {
        this.records.next(newRecords);
    }

    setCurrentStyle(newStyle: number) {
        this.currentStyle.next(newStyle);
    }

    setConfig(newConfig: any) {
        this.config.next(newConfig);
    }

    setActiveForm(activeOrNot: boolean) {
        this.activeForm.next(activeOrNot);
    }

    setActiveSearchForm(activeOrNot: boolean) {
        this.activeSearchForm.next(activeOrNot);
    }

    setActiveUploadForm(activeOrNot: boolean) {
        this.activeUploadForm.next(activeOrNot);
    }

    setLastSearch(request: SearchRequest) {
        this.lastSearch.next(request);
    }

    setLastDisplayedRecord(record: Record) {
        this.lastDisplayedRecord.next(record);
    }

    setStudios(newStudios: Array<Studio>) {
        this.studios.next(newStudios);
    }
}
