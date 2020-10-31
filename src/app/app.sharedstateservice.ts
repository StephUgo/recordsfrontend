import { Injectable } from '@angular/core';
import { Record } from './model/record';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppSharedStateService {

    records = new BehaviorSubject<Array<Record>>([]); // The current displayed list of records
    currentStyle = new BehaviorSubject<number>(0); // The current selected style (TODO : remove ?)
    config = new BehaviorSubject<any>({
        currentPage: 1,
        itemsPerPage: 5,
        totalItems: 0
    }); // NGxPagination configuration
    activeForm = new BehaviorSubject<boolean>(false);
    activeSearchForm = new BehaviorSubject<boolean>(false);

    // Observable streams
    setRecords$ = this.records.asObservable();
    setCurrentStyle$ = this.currentStyle.asObservable();
    setConfig$ = this.config.asObservable();
    setActiveForm$ = this.activeForm.asObservable();
    setActiveSearchForm$ = this.activeSearchForm.asObservable();

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
}
