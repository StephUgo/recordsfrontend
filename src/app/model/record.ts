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
        public Reference: string | null,
        public Period: string,
        public Year: number,
        public ImageFileName?: string,
        public Comments?: string,
        public keywords?: string[]) { }

    public _id: string | null = null;
}
