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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = Constants.appTitle;

  records: Array<Record> | null = null; // The current displayed list of records
  currentStyle: number | null = null; // The current selected style (TODO : remove ?)
  config: any; // NGxPagination configuration
  lastSearchRequest: SearchRequest | null = null; // The last search request
  activeForm = false;
  activeSearchForm = false;
  activeUploadForm = false;

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
  }

  ngOnInit(): void {
    if (this.api) {
      // By default, display the inital list of records
      this.api.getRecords().subscribe(res => {
        console.log(res);
        this.setRecords(res);
      }, err => {
        console.log(err);
        if (this.userComponent !== null) {
          this.userComponent.onLoginClick();
        }
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

  onActivate(componentReference: any) {
    if (componentReference instanceof RecordslistComponent) {
      console.log(componentReference);
      componentReference.saveRecordRequested.subscribe((record: Record) => {
        this.onSaveRecordRequested(record);
      });
      componentReference.deleteRecordRequested.subscribe((recordDeletionID: RecordDeletionID) => {
        this.onDeleteRecordRequested(recordDeletionID);
      });
      componentReference.updateRecordRequested.subscribe((record: Record) => {
        this.onUpdateRecordRequested(record);
      });
      componentReference.addKeywordsRequested.subscribe((records: Record[]) => {
        this.onAddKeywordsRequested(records);
      });
      componentReference.pageChanged.subscribe((newPage: number) => {
        this.onPageChanged(newPage);
      });
      componentReference.sortRequested.subscribe((sortRequest: [string, boolean]) => {
        this.onSortRequested(sortRequest);
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
      this.api.searchRecords(request).subscribe(res => {
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
        if ((this.lastSearchRequest.Sort !== null) && (this.recordListComponent !== undefined) && (this.recordListComponent !== null)) {
          this.recordListComponent.updateSortOptionsFromSortId(this.lastSearchRequest.Sort);
        }
        this.router.navigate(['/list']);
      }, err => {
        console.log(err);
      });
    } else {
      console.log('Search records backend service is undefined !');
    }
  }

  /**
   * Page changed event handler
   * @param newPage Page number
   */
  onPageChanged(newPage: number): void {
    if (this.lastSearchRequest != null) {
      this.lastSearchRequest.Skip = (newPage - 1) * this.config.itemsPerPage;
      this.lastSearchRequest.Limit = this.config.itemsPerPage;
    } else {
      this.lastSearchRequest = new SearchRequest(null, null, null, null, null, null, null, null, null, null, 1,
        this.config.itemsPerPage, (newPage - 1) * this.config.itemsPerPage);
    }
    this.onSearchRecordsRequested(this.lastSearchRequest);
  }

  /**
   * Sort requested
   * @param sortRequest sort options
   */
  onSortRequested(sortRequest: [string, boolean]): void {
    if (this.lastSearchRequest == null) {
      this.lastSearchRequest = new SearchRequest(null, '', '', '', '', '', null, '', '', '', 0, 5, 0);
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
        this.api.deleteRecord(deleteQueryString).subscribe(res => {
          console.log(res);
        }, err => {
          console.log(err);
        });
      }

      // 2nd save the new version of the record
      console.log('saveRecord : ' + newRecord);
      this.api.saveRecord(newRecord).subscribe(saveRes => {
        // If Ok, we relaunch a search on the selected style
        console.log(saveRes);
        const request = new SearchRequest(this.currentStyle, recordToSave.Artist, '', '', '', '', null, '', '', '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          this.handleLastSearchResults(searchRes, request);
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
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
      this.api.deleteRecord(deleteQueryString).subscribe(res => {
        // If Ok, we relaunch a search on the selected style
        console.log(res);
        const request = new SearchRequest(recordToDelete.style, '', '', '', '', '', null, '', '',  '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          this.handleLastSearchResults(searchRes, request);
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    } else {
      console.log('Delete record backend service is undefined !');
    }
  }

  /**
   * UPDATE a Record
   * @param recordToSave the RecordPost as transmitted by the RecordFormComponent
   */
  onUpdateRecordRequested(recordToSave: Record): void {
    this.setCurrentStyle(this.recordUtils.getStyleIdFromStyleName(recordToSave));
    if (this.api) {

      const newRecord = this.recordUtils.getUpdatedObjectForHTTPPost(recordToSave);
      console.log('updateRecord : ' + newRecord);

      this.api.updateRecord(newRecord).subscribe(saveRes => {
        // If Ok, we relaunch a search on the selected style
        console.log(saveRes);
        const request = (this.lastSearchRequest !== null) ? this.lastSearchRequest :
          new SearchRequest(this.currentStyle, recordToSave.Artist, '', '', '', '', null, '', '', '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          this.handleLastSearchResults(searchRes, request);
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
      });
    } else {
      console.log('Save record backend service is undefined !');
    }
  }


  /**
 * UPDATE a Record
 * @param recordToSave the RecordPost as transmitted by the RecordFormComponent
 */
  onAddKeywordsRequested(recordsToSave: Record[]): void {
    if (this.api) {

      this.api.updateKeywords(recordsToSave).subscribe(saveRes => {
        // If Ok, we relaunch a search on the selected style
        console.log(saveRes);
        const request = (this.lastSearchRequest !== null) ? this.lastSearchRequest :
          new SearchRequest(this.currentStyle, '', '', '', '', '', null, '', '', '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          this.handleLastSearchResults(searchRes, request);
        }, err => {
          console.log(err);
        });
      }, err => {
        console.log(err);
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
   * Handler for cover upload event (form submit)
   */
  onUploadCoverRequested(formData: FormData) {
    this.api.uploadCover(formData).subscribe((response) => {
      console.log('response  = ', response);
      alert('File(s) uploaded successfully !');
    },
      (error) => {
        console.log('error = ', error);
        alert('File upload error : ' + error);
      });
  }

  onClickToggle() {
    this.activeForm = !this.activeForm;
    if (this.activeForm) {
      this.activeSearchForm = false;
      this.activeUploadForm = false;
    }
    this.appStateService.setActiveForm(this.activeForm);
  }

  onClickSearchToggle() {
    this.activeSearchForm = !this.activeSearchForm;
    if (this.activeSearchForm) {
      this.activeForm = false;
      this.activeUploadForm = false;
    }
    this.appStateService.setActiveSearchForm(this.activeSearchForm);
  }

  onClickUploadToggle() {
    this.activeUploadForm = !this.activeUploadForm;
    if (this.activeUploadForm) {
      this.activeForm = false;
      this.activeSearchForm = false;
    }
    this.appStateService.setActiveUploadForm(this.activeUploadForm);
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
