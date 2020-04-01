/**
 * Class used to post a Record to the backend.
 */
import { Record } from '../model/record';
export class RecordPost {

    constructor(
        public style: number,
        public record: Record) { }

    public getObjectForHTTPPost(): any {
        return {
            'Style': this.style.toString(),
            'Artist': this.record.Artist,
            'Title': this.record.Title,
            'Format': this.record.Format,
            'Label': this.record.Label,
            'Country': this.record.Country,
            'Year': this.record.Year,
            'Period': this.record.Period,
            'Reference': this.record.Reference,
            'Comments': this.record.Comments,
            'ImageFileName': this.record.ImageFileName
        };
    }

    public getUpdatedObjectForHTTPPost(): any {
        return {
            'ID': this.record._id,
            'Style': this.style.toString(),
            'Artist': this.record.Artist,
            'Title': this.record.Title,
            'Format': this.record.Format,
            'Label': this.record.Label,
            'Country': this.record.Country,
            'Year': this.record.Year,
            'Period': this.record.Period,
            'Reference': this.record.Reference,
            'Comments': this.record.Comments,
            'ImageFileName': this.record.ImageFileName
        };
    }
}
