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


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = Constants.appTitle;

  public records: Array<Record>|null = null; // The current displayed list of records
  public currentStyle: number | null = null; // The current selected style (TODO : remove ?)
  public config: any; // NGxPagination configuration
  public lastSearchRequest: SearchRequest | null = null; // The last search request

  @ViewChild(RecordslistComponent) recordListComponent: RecordslistComponent | null = null;

  constructor(private api: ApiService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private recordUtils: RecordUtils) {
    this.matIconRegistry.addSvgIcon('edit', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/edit.svg'));
    this.matIconRegistry.addSvgIcon('delete', this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/delete.svg'));
  }

  ngOnInit(): void {
    if (this.api) {
      // By default, display the inital list of records
      this.api.getRecords().subscribe(res => {
        console.log(res);
        this.records = res;
      }, err => {
        console.log(err);
      });
    } else {
      console.log('The backend service is undefined !');
    }
    this.currentStyle = 1;
    this.config = {
      currentPage: 1,
      itemsPerPage: 5,
      totalItems: 0
    };
  }

  /**
   * SEARCH for records
   * @param request Record search request
   */
  onSearchRecordsRequested(request: SearchRequest): void {
    this.currentStyle = request.Style;
    this.config.itemsPerPage = request.Limit;
    request.Limit = this.config.itemsPerPage;
    if (this.api) {
      console.log('SearchRecords : ' + request);
      this.api.searchRecords(request).subscribe(res => {
        this.lastSearchRequest = request;
        if (this.lastSearchRequest.Skip != null) {
          this.config.currentPage = this.lastSearchRequest.Skip / this.config.itemsPerPage + 1;
        } else {
          this.config.currentPage = 1;
        }
        console.log(res);
        if (res.totalCount != null)  {
          this.config.totalItems = res.totalCount;
        } else {
          this.config.totalItems = res.length;
        }
        if (res.records != null) {
          this.records = res.records;
        } else {
          this.records = res;
        }
        if ((this.recordListComponent !== null) && (this.lastSearchRequest.Sort !== null)) {
          this.recordListComponent.updateSortOptionsFromSortId(this.lastSearchRequest.Sort);
        }
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
      this.lastSearchRequest = new SearchRequest(1, null, null, null, null, null, null, null, 1,
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
      this.lastSearchRequest = new SearchRequest(null, '', '', '', '', '', null, '', 0, 5, 0);
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
    this.currentStyle = this.recordUtils.getStyleIdFromStyle(recordToSave);
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
        const request = new SearchRequest(this.currentStyle, '', '', '', '', '', null, '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          this.lastSearchRequest = request;
          console.log(searchRes);
          if (searchRes.records != null) {
            this.records = searchRes.records;
          } else {
            this.records = searchRes;
          }
          this.config.currentPage = 1;
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
        const request = new SearchRequest(recordToDelete.style, '', '', '', '', '', null, '', 0, null, null);
        this.api.searchRecords(request).subscribe(res2 => {
          this.lastSearchRequest = request;
          console.log(res2);
          if (res2.records != null) {
            this.records = res2.records;
          } else {
            this.records = res2;
          }
          this.config.currentPage = 1;
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
    this.currentStyle = this.recordUtils.getStyleIdFromStyle( recordToSave);
    if (this.api) {

      const newRecord = this.recordUtils.getUpdatedObjectForHTTPPost(recordToSave);
      console.log('updateRecord : ' + newRecord);

      this.api.updateRecord(newRecord).subscribe(saveRes => {
        // If Ok, we relaunch a search on the selected style
        console.log(saveRes);
        const request = new SearchRequest(this.currentStyle, '', '', '', '', '', null, '', 0, null, null);
        this.api.searchRecords(request).subscribe(searchRes => {
          console.log(searchRes);
          this.lastSearchRequest = request;
          if (searchRes.records != null) {
            this.records = searchRes.records;
          } else {
            this.records = searchRes;
          }
          this.config.currentPage = 1;
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
   * Handler for cover upload event (form submit)
   */
  onUploadCoverRequested(formData: FormData) {
    this.api.uploadCover(formData).subscribe((response) => {
        console.log('response  = ', response);
        alert('File uploaded successfully !');
      },
      (error) => {
        console.log('error = ', error);
        alert('File upload error : ' + error);
      });
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
