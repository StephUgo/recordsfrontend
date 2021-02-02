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
        public audioSamples?: string[]) { }

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
    }

}

export function hasAdditionalPictures(record: Record): boolean {
    return (record.additionalPics !== undefined) && (record.additionalPics !== null) && (record.additionalPics.length > 0);
}

export function hasAudioSamples(record: Record): boolean {
    return (record.audioSamples !== undefined) && (record.audioSamples !== null) && (record.audioSamples.length > 0);
}
