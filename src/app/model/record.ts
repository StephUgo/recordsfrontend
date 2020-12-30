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

}

export function hasAdditionalPictures(record: Record): boolean {
    return (record.additionalPics !== undefined) && (record.additionalPics !== null) && (record.additionalPics.length > 0);
}

export function hasAudioSamples(record: Record): boolean {
    return (record.audioSamples !== undefined) && (record.audioSamples !== null) && (record.audioSamples.length > 0);
}
