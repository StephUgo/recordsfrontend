import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { SearchRequest } from './app/model/searchrequest';
import { environment } from './environments/environment';
import { Record } from './app/model/record';
import { RecordUtils } from './app/recordutils';
import { Studio } from './app/model/studio';

const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
const backendServerURL = environment.backendURL + ':' + environment.backendPort;
const apiUrlByDefault = backendServerURL + '/records/searchrecordsdefault/';
const apiSearchRecordsUrl = backendServerURL + '/records/searchrecords/';
const apiSaveRecordUrl = backendServerURL + '/records/saverecord/';
const apiUpdateRecordUrl = backendServerURL + '/records/updaterecord/';
const apiUpdateKeywordsUrl = backendServerURL + '/records/updatekeywords/';
const apiDeleteRecordUrl = backendServerURL + '/records/deleterecord/';
const apiUploadCoverUrl = backendServerURL + '/records/uploadcover/';
const apiSearchStudiosUrl = backendServerURL + '/studios/searchstudios/';
const apiSaveStudioUrl = backendServerURL + '/studios/savestudio/';
const apiDeleteStudioUrl = backendServerURL + '/studios/deletestudio/';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient, private recordUtils: RecordUtils) { }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
            if (error.status === 401) {
                alert('You\'re not authorized to access the backend server. Please login.');
            }
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    }

    private extractData(res: Record[]): Record[] {
        return res || new Array<Record>();
    }

    /**
     * Default records retrieval when accessing root app page
     */
    getRecords(): Observable<any> {
        const httpParams = new HttpParams().set('Limit', '5');
        const httpOptions = { headers: httpHeaders, params: httpParams };
        return this.http.get<Record[]>(apiUrlByDefault, httpOptions).pipe(
            map(this.extractData),
            catchError(this.handleError));
    }

    /**
     * Search records according to the request object provided in parameter.
     * @param request request object
     */
    searchRecords(request: SearchRequest): Observable<any> {

        // Build URL Query String from Search request model object.
        const httpParams = new HttpParams().set('Style', request.Style != null ? request.Style.toString() : '')
            .set('Artiste', request.Artiste !== undefined && request.Artiste !== null ? request.Artiste : '')
            .set('Titre', request.Titre !== undefined && request.Titre !== null ? request.Titre : '')
            .set('Country', request.Country !== undefined && request.Country !== null ? request.Country : '')
            .set('Format', request.Format !== undefined && request.Format !== null ? request.Format : '')
            .set('Year', request.Year !== undefined && request.Year !== null ? request.Year.toString() : '')
            .set('Period', request.Period !== undefined && request.Period !== null ? request.Period : '')
            .set('Reference', request.Reference !== undefined && request.Reference !== null ? request.Reference : '')
            .set('Keywords', request.Keywords !== undefined && request.Keywords !== null ? request.Keywords : '')
            .set('Label', request.Label !== undefined &&  request.Label !== null ? request.Label : '')
            .set('Sort', request.Sort !== undefined && request.Sort !== null ? request.Sort.toString() : '1')
            .set('Limit', request.Limit !== undefined && request.Limit != null ? request.Limit.toString() : '')
            .set('Skip', request.Skip !== undefined && request.Skip != null ? request.Skip.toString() : '');

        console.log(httpParams);

        const httpOptions = {
            headers: httpHeaders,
            params: httpParams
        };

        console.log(httpOptions);

        return this.http.get<Record[]>(apiSearchRecordsUrl, httpOptions).pipe(
            map(this.extractData),
            catchError(this.handleError));
    }


    /**
     * Save record according to the object provided in parameter.
     * @param recordPostObject  object to be posted
     */
    saveRecord(recordPostObject: Object): Observable<any> {

        console.log(recordPostObject);

        return this.http.post(apiSaveRecordUrl, recordPostObject).pipe(catchError(this.handleError));
    }

    /**
     * Delete record according to the request object provided in parameter.
     * @param deleteRequest request object
     */
    deleteRecord(deleteRequest: string): Observable<any> {

        console.log(deleteRequest);

        return this.http.delete(apiDeleteRecordUrl + deleteRequest).pipe(catchError(this.handleError));
    }

    /**
     * Update record according to the object provided in parameter.
     * @param recordPostObject object to be posted
     */
    updateRecord(recordPostObject: Object): Observable<any> {

        console.log(recordPostObject);

        return this.http.post(apiUpdateRecordUrl, recordPostObject).pipe(catchError(this.handleError));
    }


    /**
     * Update keywords of several records according to the array of records provided in parameter.
     * @param records the array of records to be posted
     */
    updateKeywords(records: Record[]): Observable<any> {

        console.log(records);

        const recordsPostArray: Object[] = [];

        records.forEach( (record) => { recordsPostArray.push(this.recordUtils.getUpdatedObjectForHTTPPost(record)); });

        return this.http.post(apiUpdateKeywordsUrl, recordsPostArray).pipe(catchError(this.handleError));
    }
    /**
     * Handler for cover upload event
     */
    uploadCover(formData: FormData): Observable<any> {
        return this.http.post(apiUploadCoverUrl, formData).pipe(catchError(this.handleError));
    }

    private extractStudio(res: Studio[]): Studio[] {
        return res || new Array<Studio>();
    }

    /**
     * Default studios retrieval
     */
    getStudios(): Observable<any> {
        const httpParams = new HttpParams();
        const httpOptions = { headers: httpHeaders, params: httpParams };
        return this.http.get<Studio[]>(apiSearchStudiosUrl, httpOptions).pipe(
            map(this.extractStudio),
            catchError(this.handleError));
    }

    /**
    * Default studios retrieval
    */
    searchStudios(request: string): Observable<any> {
        const httpParams = new HttpParams().set('name', request !== undefined && request !== null ? request : '');
        const httpOptions = { headers: httpHeaders, params: httpParams };
        return this.http.get<Studio[]>(apiSearchStudiosUrl, httpOptions).pipe(
            map(this.extractStudio),
            catchError(this.handleError));
    }

    /**
     * Save studio according to the object provided in parameter.
     * @param studio  studio to be posted
     */
     saveStudio(studio: Studio): Observable<any> {

        console.log(studio);

        return this.http.post(apiSaveStudioUrl, studio).pipe(catchError(this.handleError));
    }

    /**
     * Delete studi according to the request object provided in parameter.
     * @param deleteRequest request object
     */
     deleteStudio(deleteRequest: string): Observable<any> {

        console.log(deleteRequest);

        return this.http.delete(apiDeleteStudioUrl + deleteRequest).pipe(catchError(this.handleError));
    }
}
