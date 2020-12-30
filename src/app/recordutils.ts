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

    private styles: Array<{ id: number, name: string, label: string }> = [
        { id: 0, name: '', label: '' },
        { id: 1, name: 'Soul/Funk', label: 'Soul / Funk' },
        { id: 2, name: 'Rap', label: 'Rap' },
        { id: 3, name: 'Jazz', label: 'Jazz' },
        { id: 4, name: 'Soundtracks', label: 'Soundtracks' },
        { id: 5, name: 'Misc', label: 'Misc.' },
        { id: 6, name: 'AOR', label: 'AOR' },
        { id: 7, name: 'Audiophile', label: 'Audiophile' },
        { id: 8, name: 'Latin', label: 'Latin' },
        { id: 9, name: 'African', label: 'African' },
        { id: 10, name: 'Island', label: 'Island' },
        { id: 11, name: 'Hawaii', label: 'Hawaii' },
        { id: 12, name: 'Classical', label: 'Classical' },
        { id: 13, name: 'Spiritual Jazz', label: 'Spiritual Jazz' },
        { id: 14, name: 'Rock', label: 'Rock' },
        { id: 15, name: 'Reggae', label: 'Reggae' },
        { id: 16, name: 'Library', label: 'Library' },
        { id: 17, name: 'European', label: 'European' },
        { id: 18, name: 'Brazilian', label: 'Brazilian' },
        { id: 19, name: 'Japanese', label: 'Japanese' },
        { id: 20, name: 'Electro', label: 'Electro' },
        { id: 21, name: 'Brit Funk', label: 'Brit Funk' },
        { id: 22, name: 'Funky French', label: 'Funky French' }
    ];

    /**
     * Returns the style numeric id from the style string value.
     */
    getStyleIdFromStyleName(record: Record): number {
        return this.getStyleFromStyleName(record).id;
    }

    /**
     * Returns the style from the style string value.
     */
    getStyleFromStyleName(record: Record): { id: number, name: string, label: string } {
        if (record.Style !== null) {
            for (let index = 0; index < this.styles.length; index++) {
                const style = this.styles[index];
                if (style.name === record.Style) {
                    return style;
                }
            }
        }
        throw new Error('Unknown style.');
    }

    /**
     * Get the style name value from the style numeric id.
     */
    getStyleNameFromStyleId(styleId: number): string {
        if (styleId > 0 && styleId < this.styles.length) {
            return this.styles[styleId].name;
        }
        throw new Error('Unknown style.');
    }

    /**
     * Get the style from the style numeric id.
     */
    getStyleFromStyleId(styleId: number): { id: number, name: string, label: string }  {
        if (styleId > 0 && styleId < this.styles.length) {
            return this.styles[styleId];
        }
        throw new Error('Unknown style.');
    }

    getRecordDeletionID(record: Record): RecordDeletionID {
        if ((record !== null) && (record._id !== null)) {
            return new RecordDeletionID(this.getStyleIdFromStyleName(record), record._id);
        } else {
            throw new Error('Invalid record for deletion.');
        }
    }

    getObjectForHTTPPost(record: Record): any {
        return {
            'Style': this.getStyleIdFromStyleName(record).toString(),
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
            'Style': this.getStyleIdFromStyleName(record).toString(),
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
            'keywords': record.keywords,
            'additionalPics': record.additionalPics,
            'audioSamples': record.audioSamples
        };
    }

    getStyles(): ReadonlyArray<{ id: number, name: string, label: string }> {
        return this.styles;
    }

    getKeywordsContents(record: Record): string {
        let keywords = '';
        if ((record.keywords !== undefined) && (record.keywords !== null)) {
            for (let index = 0; index < record.keywords.length; index++) {
                if (index === 0) {
                    keywords = 'Keywords: ';
                }
                const element = record.keywords[index];
                keywords += element;
                if (index === record.keywords.length - 1) {
                    keywords += '.';
                } else {
                    keywords += ', ';
                }
            }
        }
        return keywords;
    }

    hasLocation(record: Record): boolean {
        if (record !== null) {
            const keywords = record.keywords;
            if (keywords !== undefined && keywords !== null) {
                for (let index = 0; index < keywords.length; index++) {
                    const keyword = keywords[index];
                    if (keyword.startsWith('Recorded @{')) {
                        const stringLocation = keyword.substring(keyword.indexOf('{'));
                        try {
                            const location = JSON.parse(stringLocation);
                            let hasError = false;
                            if (location.lat === undefined) {
                                console.error('Error when parsing location : undefined latitude.');
                                hasError = true;
                            }
                            if (location.lon === undefined) {
                                console.error('Error when parsing location : undefined longitude.');
                                hasError = true;
                            }
                            if (location.name === undefined) {
                                console.warn('Warning when parsing location : undefined name.');
                            }
                            if (!hasError) {
                                return true;
                            }
                        } catch (error) {
                            console.error('Error when parsing location : ' + error);
                        }
                    }
                }
            }
        }
        return false;
    }
}
