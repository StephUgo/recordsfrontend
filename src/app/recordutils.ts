import { Injectable } from '@angular/core';
import { RecordDeletionID } from './model/recorddeletionID';
import { Record } from './model/record';

/**
 * Utility class for managing records.
 */
@Injectable({
    providedIn: 'root'
})
export class RecordUtils {

    /**
     * Returns the style numeric id from the style string value.
     */
    public getStyleIdFromStyle(record: Record): number {
        if (record.Style !== null) {
            switch (record.Style) {
                case 'Soul/Funk': return 1;
                case 'Rap': return 2;
                case 'Jazz': return 3;
                case 'Soundtracks': return 4;
                case 'Misc': return 5;
                case 'AOR': return 6;
                case 'Audiophile': return 7;
                case 'Latin': return 8;
                case 'African': return 9;
                case 'Island': return 10;
                case 'Hawaii': return 11;
                case 'Classical': return 12;
                case 'Spiritual Jazz': return 13;
                case 'Rock': return 14;
                case 'Reggae': return 15;
                case 'Library': return 16;
                case 'European': return 17;
                case 'Brazilian': return 18;
                case 'Japanese': return 19;
                case 'Electro': return 20;
                case 'Brit Funk': return 21;
            }
        }
        return null;
    }


    public getRecordDeletionID(record: Record): RecordDeletionID {
        if (record !== null) {
            return new RecordDeletionID(this.getStyleIdFromStyle(record), record._id);
        } else {
            return null;
        }
    }

    public getObjectForHTTPPost(record: Record): any {
        return {
            'Style': this.getStyleIdFromStyle(record).toString(),
            'Artist': record.Artist,
            'Title': record.Title,
            'Format': record.Format,
            'Label': record.Label,
            'Country': record.Country,
            'Year': record.Year,
            'Period': record.Period,
            'Reference': record.Reference,
            'Comments': record.Comments,
            'ImageFileName': record.ImageFileName
        };
    }

    public getUpdatedObjectForHTTPPost(record: Record): any {
        return {
            'ID': record._id,
            'Style': this.getStyleIdFromStyle(record).toString(),
            'Artist': record.Artist,
            'Title': record.Title,
            'Format': record.Format,
            'Label': record.Label,
            'Country': record.Country,
            'Year': record.Year,
            'Period': record.Period,
            'Reference': record.Reference,
            'Comments': record.Comments,
            'ImageFileName': record.ImageFileName
        };
    }

}
