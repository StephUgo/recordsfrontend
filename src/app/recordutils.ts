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
    getStyleIdFromStyle(record: Record): number {
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
        throw new Error('Unknown style.');
    }

    /**
     * Get the style string value from the style numeric id.
     */
    getStyleFromStyleId(styleId: number): string {
        switch (styleId) {
            case 1: return 'Soul/Funk';
                break;
            case 2: return 'Rap';
                break;
            case 3: return 'Jazz';
                break;
            case 4: return 'Soundtracks';
                break;
            case 5: return 'Misc';
                break;
            case 6: return 'AOR';
                break;
            case 7: return 'Audiophile';
                break;
            case 8: return 'Latin';
                break;
            case 9: return 'African';
                break;
            case 10: return 'Island';
                break;
            case 11: return 'Hawaii';
                break;
            case 12: return 'Classical';
                break;
            case 13: return 'Spiritual Jazz';
                break;
            case 14: return 'Rock';
                break;
            case 15: return 'Reggae';
                break;
            case 16: return 'Library';
                break;
            case 17: return 'European';
                break;
            case 18: return 'Brazilian';
                break;
            case 19: return 'Japanese';
                break;
            case 20: return 'Electro';
                break;
            case 21: return 'Brit Funk';
                break;
        }
        throw new Error('Unknown style.');
    }


    getRecordDeletionID(record: Record): RecordDeletionID {
        if ((record !== null) && (record._id !== null)) {
            return new RecordDeletionID(this.getStyleIdFromStyle(record), record._id);
        } else {
            throw new Error('Invalid record for deletion.');
        }
    }

    getObjectForHTTPPost(record: Record): any {
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

    getUpdatedObjectForHTTPPost(record: Record): any {
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
            'ImageFileName': record.ImageFileName,
            'keywords': record.keywords
        };
    }
}
