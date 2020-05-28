import { Injectable } from '@angular/core';
import { Record } from './model/record';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppSharedStateService {

    records = new Subject<Array<Record>>(); // The current displayed list of records
    currentStyle = new Subject<number>(); // The current selected style (TODO : remove ?)
    config = new Subject<any>(); // NGxPagination configuration

    // Observable streams
    setRecords$ = this.records.asObservable();
    setCurrentStyle$ = this.currentStyle.asObservable();
    setConfig$ = this.config.asObservable();

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
}
