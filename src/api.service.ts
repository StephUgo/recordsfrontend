import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { SearchRequest } from './app/model/searchrequest';
import { environment } from './environments/environment';

const httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
const backendServerURL = environment.backendURL + ':' + environment.backendPort;
const apiUrlByDefault = backendServerURL + '/records/searchrecordsdefault/';
const apiSearchRecordsUrl = backendServerURL + '/records/searchrecords/';
const apiSaveRecordUrl = backendServerURL + '/records/saverecord/';
const apiUpdateRecordUrl = backendServerURL + '/records/updaterecord/';
const apiDeleteRecordUrl = backendServerURL + '/records/deleterecord/';
const apiUploadCoverUrl = backendServerURL + '/records/uploadcover/';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

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
        }
        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    }

    private extractData(res: Response) {
        const body = res;
        return body || {};
    }

    /**
     * Default records retrieval when accessing root app page
     */
    public getRecords(): Observable<any> {
        const httpParams = new HttpParams().set('Limit', '5');
        const httpOptions = { headers: httpHeaders, params: httpParams };
        return this.http.get(apiUrlByDefault, httpOptions).pipe(
            map(this.extractData),
            catchError(this.handleError));
    }

    /**
     * Search records according to the request object provided in parameter.
     * @param request request object
     */
    public searchRecords(request: SearchRequest): Observable<any> {

        // Build URL Query String from Search request model object.
        const httpParams = new HttpParams().set('Style', request.Style != null ? request.Style.toString() : '')
            .set('Artiste', typeof request.Artiste !== 'undefined' ? request.Artiste : '')
            .set('Titre', typeof request.Titre !== 'undefined' ? request.Titre : '')
            .set('Country', typeof request.Country !== 'undefined' ? request.Country : '')
            .set('Format', typeof request.Format !== 'undefined' ? request.Format : '')
            .set('Year', typeof request.Year !== 'undefined' && request.Year !== null ? request.Year.toString() : '')
            .set('Period', typeof request.Period !== 'undefined' ? request.Period : '')
            .set('Label', typeof request.Label !== 'undefined' ? request.Label : '')
            .set('Sort', typeof request.Sort !== 'undefined' ? request.Sort.toString() : '1')
            .set('Limit', request.Limit != null ? request.Limit.toString() : '')
            .set('Skip', request.Skip != null ? request.Skip.toString() : '');

        console.log(httpParams);

        const httpOptions = {
            headers: httpHeaders,
            params: httpParams
        };

        console.log(httpOptions);

        return this.http.get(apiSearchRecordsUrl, httpOptions).pipe(
            map(this.extractData),
            catchError(this.handleError));
    }


    /**
     * Save record according to the request object provided in parameter.
     * @param saveRequest save request object
     */
    public saveRecord(saveRequest: Object): Observable<any> {

        console.log(saveRequest);

        return this.http.post(apiSaveRecordUrl, saveRequest);
    }

    /**
     * Delete record according to the request object provided in parameter.
     * @param deleteRequest request object
     */
    public deleteRecord(deleteRequest: string): Observable<any> {

        console.log(deleteRequest);

        return this.http.delete(apiDeleteRecordUrl + deleteRequest);
    }

    /**
     * Update record according to the request object provided in parameter.
     * @param saveRequest save request object
     */
    public updateRecord(saveRequest: Object): Observable<any> {

        console.log(saveRequest);

        return this.http.post(apiUpdateRecordUrl, saveRequest);
    }

    /**
     * Handler for cover upload event
     */
    public uploadCover(formData: FormData): Observable<any> {
        return this.http.post(apiUploadCoverUrl, formData);
    }
}
