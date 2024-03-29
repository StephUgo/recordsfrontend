import { Constants } from '../constants';

/**
 * Record model object (used within frontend <=> backend communications).
 */
export class Record {

    constructor(
        public Style: string,
        public Artist: string,
        public Title: string,
        public Format: string,
        public Label: string,
        public Country: string,
        public Reference: string,
        public Period: string,
        public Year: number,
        public ImageFileName?: string,
        public Comments?: string,
        public keywords?: string[],
        public additionalPics?: string[],
        public audioSamples?: string[],
        public storageLocation?: string) { }

    _id: string | null = null;

    copyFrom(record: Record) {
        this.Style = record.Style;
        this.Artist = record.Artist;
        this.Title = record.Title;
        this.Format = record.Format;
        this.Label = record.Label;
        this.Country = record.Country;
        this.Reference = record.Reference;
        this.Period = record.Period;
        this.Year = record.Year;
        this.ImageFileName = record.ImageFileName;
        this.Comments = record.Comments;
        this.keywords = record.keywords;
        this.additionalPics = record.additionalPics;
        this.audioSamples = record.audioSamples;
        this.storageLocation = record.storageLocation;
    }

}

export function hasAdditionalPictures(record: Record): boolean {
    return (record.additionalPics !== undefined) && (record.additionalPics !== null) && (record.additionalPics.length > 0);
}

export function hasAudioSamples(record: Record): boolean {
    return (record.audioSamples !== undefined) && (record.audioSamples !== null) && (record.audioSamples.length > 0);
}

export function isAudiophile(record: Record): boolean {
    return (record !== undefined && record !== null && record.keywords !== undefined
        && record.keywords !== null && record.keywords.includes(Constants.audiophileKeyword)) ? true : false;
}

export function toggleAudiophile(record: Record): void {
    if (record === undefined || record === null) {
        return;
    }
    if (record.keywords === undefined || record.keywords === null) {
        record.keywords = [Constants.audiophileKeyword];
    } else {
        if (isAudiophile(record)) {
            const index = record.keywords.indexOf(Constants.audiophileKeyword);
            if (index > -1) {
                record.keywords.splice(index, 1);
            }
        } else  {
            record.keywords.push(Constants.audiophileKeyword);
        }
    }
}
