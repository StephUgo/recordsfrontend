import { Component, OnInit, ViewChild } from '@angular/core';
import { Record } from './model/record';
import { SearchRequest } from './model/searchrequest';
import { ApiService } from '../api.service';
import { RecordUtils } from './recordutils';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RecordDeletionID } from './model/recorddeletionID';
import { Constants } from './constants';
import { RecordslistComponent } from './recordslist/recordslist.component';
import { AppSharedStateService } from './app.sharedstateservice';
import { Router } from '@angular/router';
import { UserComponent } from './users/user.component';
import { RecordDetailsComponent } from './details/recorddetails.component';
import { Studio } from './model/studio';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = Constants.appTitle;

    records: Array<Record> | null = null; // The current displayed list of records
    studios: Array<Studio> | null = null; // The current displayed list of studios
    currentStyle: number | null = null; // The current selected style (TODO : remove ?)
    config: any; // NGxPagination configuration
    lastSearchRequest: SearchRequest | null = null; // The last search request
    activeForm = false;
    activeSearchForm = false;
    activeUploadForm = false;
    activeStudioForm = false;

    @ViewChild(RecordslistComponent) recordListComponent: RecordslistComponent | null = null;
    @ViewChild(UserComponent) userComponent: UserComponent | null = null;

    constructor(private api: ApiService,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private recordUtils: RecordUtils,
        private appStateService: AppSharedStateService,
        private router: Router) {
        this.matIconRegistry.addSvgIcon('edit', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/edit.svg'));
        this.matIconRegistry.addSvgIcon('delete', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/delete.svg'));
        this.matIconRegistry.addSvgIcon('comments', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/comments.svg'));
        this.matIconRegistry.addSvgIcon('keywords', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/post_add.svg'));
        this.matIconRegistry.addSvgIcon('view_list', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/view_list.svg'));
        this.matIconRegistry.addSvgIcon('view_module', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/view_module.svg'));
        this.matIconRegistry.addSvgIcon('location', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/location.svg'));
        this.matIconRegistry.addSvgIcon('pictures', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/pictures.svg'));
        this.matIconRegistry.addSvgIcon('audiosamples', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/audiosamples.svg'));
        this.matIconRegistry.addSvgIcon('checkallblack', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/check-all-black.svg'));
        this.matIconRegistry.addSvgIcon('checkallwhite', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/check-all-white.svg'));
    }

    ngOnInit(): void {
        if (this.api) {
            // By default, display the initial list of records
            this.api.getRecords().subscribe({
                next: (res) => {
                    console.log(res);
                    this.setRecords(res);
                },
                error: (err) => {
                    console.log(err);
                    if (this.userComponent !== null) {
                        this.userComponent.onLoginClick();
                    }
                }
            });
            // By default, also search the list of studios
            this.api.getStudios().subscribe({
                next: (res) => {
                    console.log(res);
                    this.studios = res;
                    this.setStudios(res);
                },
                error: (err) => console.log(err),
            });
        } else {
            console.log('The backend service is undefined !');
        }
        this.setCurrentStyle(1);
        this.config = {
            currentPage: 1,
            itemsPerPage: 5,
            totalItems: 0
        };
        this.appStateService.setConfig(this.config);
    }

    /**
   * Handler called on router activation event
   * @param componentReference reference of the component which was activated by the router
   */
    onActivate(componentReference: any) {
    /**
     * Here we subscribe to the observer of the activated components which can be either :
     *  - a RecordslistComponent
     *  - a RecordDetailsComponent
     */
        if (componentReference instanceof RecordslistComponent) {
            console.log(componentReference);
            componentReference.saveRecordRequested.subscribe((record: Record) => {
                this.onSaveRecordRequested(record);
            });
            componentReference.deleteRecordRequested.subscribe((recordDeletionID: RecordDeletionID) => {
                this.onDeleteRecordRequested(recordDeletionID);
            });
            componentReference.updateRecordRequested.subscribe((record: Record) => {
                this.onUpdateRecordRequested(record, true);
            });
            componentReference.updateRecordsRequested.subscribe((records: Record[]) => {
                this.onUpdateRecordsRequested(records);
            });
            componentReference.pageChanged.subscribe((newPage: number) => {
                this.onPageChanged(newPage);
            });
            componentReference.sortRequested.subscribe((sortRequest: [string, boolean]) => {
                this.onSortRequested(sortRequest);
            });
        } else if (componentReference instanceof RecordDetailsComponent) {
            console.log(componentReference);
            componentReference.updateRecordRequested.subscribe((record: Record) => {
                this.onUpdateRecordRequested(record, false);
            });
        }
    }

    /**
   * SEARCH for records
   * @param request Record search request
   */
    onSearchRecordsRequested(request: SearchRequest): void {
        if (request.Style !== null) {
            this.setCurrentStyle(request.Style);
        }
        this.config.itemsPerPage = request.Limit;
        request.Limit = this.config.itemsPerPage;
        if (this.api) {
            console.log('SearchRecords : ' + request);
            this.appStateService.setLastSearch(request);
            this.api.searchRecords(request).subscribe({
                next: (res) => {
                    this.lastSearchRequest = request;
                    if (this.lastSearchRequest.Skip != null) {
                        this.config.currentPage = this.lastSearchRequest.Skip / this.config.itemsPerPage + 1;
                    } else {
                        this.config.currentPage = 1;
                    }
                    console.log(res);
                    if (res.totalCount != null) {
                        this.config.totalItems = res.totalCount;
                    } else {
                        this.config.totalItems = res.length;
                    }
                    this.appStateService.setConfig(this.config);

                    if (res.records != null) {
                        this.setRecords(res.records);
                    } else {
                        this.setRecords(res);
                    }
                    if ((this.lastSearchRequest.Sort !== null) && (this.recordListComponent !== undefined)
                        && (this.recordListComponent !== null)) {
                        this.recordListComponent.updateSortOptionsFromSortId(this.lastSearchRequest.Sort);
                    }
                    this.router.navigate(['/list']);
                },
                error: (err) => {
                    console.log(err);
                    alert(err);
                }
            });
        } else {
            console.log('Search records backend service is undefined !');
        }
    }

    /**
   * PAGE CHANGED event handler
   * @param newPage Page number
   */
    onPageChanged(newPage: number): void {
        if (this.lastSearchRequest != null) {
            this.lastSearchRequest.Skip = (newPage - 1) * this.config.itemsPerPage;
            this.lastSearchRequest.Limit = this.config.itemsPerPage;
        } else {
            this.lastSearchRequest = new SearchRequest(null, null, null, null, null, null, null, null, null, null, null, 1,
                this.config.itemsPerPage, (newPage - 1) * this.config.itemsPerPage);
        }
        this.onSearchRecordsRequested(this.lastSearchRequest);
    }

    /**
   * SORT requested
   * @param sortRequest sort options
   */
    onSortRequested(sortRequest: [string, boolean]): void {
        if (this.lastSearchRequest == null) {
            this.lastSearchRequest = new SearchRequest(null, '', '', '', '', '', null, '', '', '', '',  0, 5, 0);
        }
        if (this.lastSearchRequest != null) {
            this.updateSortId(sortRequest);
            if (this.lastSearchRequest.Sort !== null) {
                this.onSearchRecordsRequested(this.lastSearchRequest);
            }
        }
    }

    /**
   * SAVE a Record
   * @param recordToSave the RecordPost as transmitted by the RecordFormComponent
   */
    onSaveRecordRequested(recordToSave: Record): void {
        this.setCurrentStyle(this.recordUtils.getStyleIdFromStyleName(recordToSave));
        if (this.api) {

            const newRecord = this.recordUtils.getObjectForHTTPPost(recordToSave);

            // 1st delete the previous version of the record
            if (recordToSave._id !== null) {
                const deleteQueryString: string = this.recordUtils.getRecordDeletionID(recordToSave).getParamsForHTTPQueryString();
                console.log('DeleteRecord before save : ' + deleteQueryString);
                this.api.deleteRecord(deleteQueryString).subscribe({
                    next: res => {
                        console.log(res);
                    },
                    error: err => {
                        console.log(err);
                    }
                });
            }

            // 2nd save the new version of the record
            console.log('saveRecord : ' + newRecord);
            this.api.saveRecord(newRecord).subscribe({
                next: (saveRes) => {
                    // If Ok, we relaunch a search on the selected style
                    console.log(saveRes);
                    const request = new SearchRequest(this.currentStyle,
                        recordToSave.Artist, '', '', '', '', null, '', '', '', '', 0, null, null);
                    this.api.searchRecords(request).subscribe({
                        next: (searchRes) => {
                            this.handleLastSearchResults(searchRes, request);
                        },
                        error: (err) => {
                            console.log(err);
                        }
                    });
                },
                error: (err) => {
                    console.log(err);
                }
            });
        } else {
            console.log('Save record backend service is undefined !');
        }
    }

    /**
   * DELETE a Record
   * @param recordToDelete the RecordID as transmitted by the RecordListComponent
   */
    onDeleteRecordRequested(recordToDelete: RecordDeletionID): void {
        if (this.api) {
            // Build the QueryString
            const deleteQueryString: string = recordToDelete.getParamsForHTTPQueryString();

            console.log('deleteRecord : ' + deleteQueryString);
            this.api.deleteRecord(deleteQueryString).subscribe({
                next: res => {
                    // If Ok, we relaunch a search on the selected style
                    console.log(res);
                    const request = new SearchRequest(recordToDelete.style, '', '', '', '', '', null, '', '', '', '', 0, null, null);
                    this.api.searchRecords(request).subscribe( {
                        next: searchRes => {
                            this.handleLastSearchResults(searchRes, request);
                        },
                        error : err => {
                            console.log(err);
                        }
                    });
                },
                error: err => {
                    console.log(err);
                }
            });
        } else {
            console.log('Delete record backend service is undefined !');
        }
    }

    /**
   * UPDATE a Record requested handler
   * @param recordToSave the RecordPost as transmitted by the RecordFormComponent
   * @param relaunchSearch if true then a search is relaunched automatically after the successful update
   */
    onUpdateRecordRequested(recordToSave: Record, relaunchSearch: boolean): void {
        this.setCurrentStyle(this.recordUtils.getStyleIdFromStyleName(recordToSave));
        if (this.api) {

            const newRecord = this.recordUtils.getUpdatedObjectForHTTPPost(recordToSave);
            console.log('updateRecord : ' + newRecord);

            this.api.updateRecord(newRecord).subscribe({
                next: (saveRes) => {
                    // If Ok and asked by the caller, we relaunch a search on the selected style
                    console.log(saveRes);
                    if (relaunchSearch) {
                        const request = (this.lastSearchRequest !== null) ? this.lastSearchRequest :
                            new SearchRequest(this.currentStyle, recordToSave.Artist, '', '', '', '', null, '', '', '', '', 0, null, null);
                        this.api.searchRecords(request).subscribe({
                            next: searchRes => {
                                this.handleLastSearchResults(searchRes, request);
                            },
                            error: err => {
                                console.log(err);
                            }
                        });
                    }
                },
                error: err => {
                    console.log(err);
                    alert('Error when updating record: ' + err);
                }
            });
        } else {
            console.log('Save record backend service is undefined !');
        }
    }


    /**
     * UPDATE Records
     * @param recordToSave the RecordPost as transmitted by the RecordFormComponent
     */
    onUpdateRecordsRequested(recordsToSave: Record[]): void {
        if (this.api) {

            this.api.updateRecords(recordsToSave).subscribe({
                next: saveRes => {
                    // If Ok, we relaunch a search on the selected style
                    console.log(saveRes);
                    const request = (this.lastSearchRequest !== null) ? this.lastSearchRequest :
                        new SearchRequest(this.currentStyle, '', '', '', '', '', null, '', '', '', '', 0, null, null);
                    this.api.searchRecords(request).subscribe({
                        next: searchRes => {
                            this.handleLastSearchResults(searchRes, request);
                        },
                        error: err => {
                            console.log(err);
                        }
                    });
                },
                error: err => {
                    console.log(err);
                }
            });
        } else {
            console.log('Save record backend service is undefined !');
        }
    }

    private handleLastSearchResults(searchRes: any, lastRequest: SearchRequest) {
        console.log(searchRes);
        this.lastSearchRequest = lastRequest;
        if (searchRes.records != null) {
            this.setRecords(searchRes.records);
        } else {
            this.setRecords(searchRes);
        }
        this.config.currentPage = 1;
        this.appStateService.setConfig(this.config);
        this.router.navigate(['/list']);
    }

    /**
   * COVER UPLOAD event handler (form submit)
   */
    onUploadCoverRequested(formData: FormData) {
        this.api.uploadCover(formData).subscribe({
            next: (response) => {
                console.log('response  = ', response);
                alert('File(s) uploaded successfully !');
            },
            error: (error) => {
                console.log('error = ', error);
                alert('File upload error : ' + error);
            }
        });
    }

    /**
   * SEARCH for studios
   * @param request Studios search request
   */
    onSearchStudiosRequested(request: string): void {
        if (this.api) {
            console.log('SearchStudios : ' + request);
            this.api.searchStudios(request).subscribe({
                next: res => {
                    console.log(res);

                    if (res.studios != null) {
                        this.setStudios(res.studios);
                    } else {
                        this.setStudios(res);
                    }

                    this.router.navigate(['/studios']);
                },
                error: err => {
                    console.log(err);
                }
            });
        } else {
            console.log('Search studios backend service is undefined !');
        }
    }
    /**
   * SAVE a Studio
   * @param studioToSave the Studio to save
   */
    onSaveStudioRequested(studioToSave: Studio): void {
        if (this.api) {

            const ID = this.getInternalIDFromStudio(studioToSave);
            // 1st delete the previous version of the studio
            if (ID !== null) {
                const deleteQueryString: string = '?ID=' + ID;
                console.log('SaveStudio before save : ' + deleteQueryString);
                this.api.deleteStudio(deleteQueryString).subscribe({
                    next: res => {
                        console.log(res);
                    },
                    error: err => {
                        console.log(err);
                    }
                });
            }

            // 2nd save the new version of the studio
            console.log('saveStudio : ' + studioToSave);
            this.api.saveStudio(studioToSave).subscribe({
                next: saveRes => {
                    // If Ok, we relaunch a search on the selected style
                    console.log(saveRes);
                    this.api.getStudios().subscribe({
                        next: res => {
                            console.log(res);
                            this.studios = res;
                            this.setStudios(res);
                            this.router.navigate(['/studios']);
                        },
                        error: err => {
                            console.log(err);
                        }
                    });
                },
                error: err => {
                    console.log(err);
                }
            });
        } else {
            console.log('Backend service is undefined !');
        }
    }

    private getInternalIDFromStudio(studio: Studio): string | null {
        if (studio !== undefined && studio !== null) {
            if (studio._id !== undefined && studio._id !== null) {
                return studio._id;
            } else {
                if (this.studios === null) {
                    return null;
                } else {
                    for (let index = 0; index < this.studios.length; index++) {
                        const existingStudio =  this.studios[index];
                        if (studio.name === existingStudio.name && existingStudio._id !== undefined) {
                            return existingStudio._id;
                        }
                    }
                    return null;
                }
            }
        } else {
            return null;
        }
    }

    onClickToggle() {
        this.activeForm = !this.activeForm;
        if (this.activeForm) {
            this.activeSearchForm = false;
            this.activeUploadForm = false;
            this.activeStudioForm = false;
        }
        this.appStateService.setActiveForm(this.activeForm);
    }

    onClickSearchToggle() {
        this.activeSearchForm = !this.activeSearchForm;
        if (this.activeSearchForm) {
            this.activeForm = false;
            this.activeUploadForm = false;
            this.activeStudioForm = false;
        }
        this.appStateService.setActiveSearchForm(this.activeSearchForm);
    }

    onClickUploadToggle() {
        this.activeUploadForm = !this.activeUploadForm;
        if (this.activeUploadForm) {
            this.activeForm = false;
            this.activeSearchForm = false;
            this.activeStudioForm = false;
        }
        this.appStateService.setActiveUploadForm(this.activeUploadForm);
    }

    onClickStudioToggle() {
        this.activeStudioForm = !this.activeStudioForm;
        if (this.activeStudioForm) {
            this.activeForm = false;
            this.activeSearchForm = false;
            this.activeUploadForm = false;
        }
        this.appStateService.setActiveStudioForm(this.activeStudioForm);
    }

    /**
   * Set records and update application state service (which triggers the associated observable)
   * @param newRecords
   */
    private setRecords(newRecords: any) {
        this.records = newRecords;
        this.appStateService.setRecords(this.records !== null ? this.records : []);
    }

    /**
   * Set records and update application state service (which triggers the associated observable)
   * @param newRecords
   */
    private setStudios(newStudios: any) {
        this.appStateService.setStudios(newStudios !== null ? newStudios : []);
    }

    /**
   * Set current style and update application state service (which triggers the associated observable)
   * @param newStyle
   */
    private setCurrentStyle(newStyle: number) {
        this.currentStyle = newStyle;
        this.appStateService.setCurrentStyle(this.currentStyle);
    }


    private updateSortId(sortRequest: [string, boolean]) {
        if (this.lastSearchRequest !== null) {
            switch (sortRequest[0]) {
                case 'artist': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 1;
                    } else {
                        this.lastSearchRequest.Sort = 2;
                    }
                    break;
                }
                case 'year': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 3;
                    } else {
                        this.lastSearchRequest.Sort = 4;
                    }
                    break;
                }
                case 'title': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 5;
                    } else {
                        this.lastSearchRequest.Sort = 6;
                    }
                    break;
                }
                case 'format': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 7;
                    } else {
                        this.lastSearchRequest.Sort = 8;
                    }
                    break;
                }
                case 'label': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 9;
                    } else {
                        this.lastSearchRequest.Sort = 10;
                    }
                    break;
                }
                case 'country': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 11;
                    } else {
                        this.lastSearchRequest.Sort = 12;
                    }
                    break;
                }
                case 'period': {
                    if (sortRequest[1] === false) {
                        this.lastSearchRequest.Sort = 13;
                    } else {
                        this.lastSearchRequest.Sort = 14;
                    }
                    break;
                }
                default: {
                    this.lastSearchRequest.Sort = null;
                    break;
                }
            }
        }
    }
}
