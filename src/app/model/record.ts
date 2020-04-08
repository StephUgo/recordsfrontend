/**
 * Record model object.
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
        public ImageFileName: string,
        public Comments: string) {}

    public _id: string;

    public getStyleIdFromStyle(): number {
        if (this.Style !== null) {
            switch (this.Style) {
                case  'Soul/Funk': return 1;
                case  'Rap': return 2;
                case  'Jazz': return 3;
                case  'Soundtracks': return 4;
                case  'Misc.': return 5;
                case  'AOR': return 6;
                case  'Audiophile': return 7;
                case  'Latin': return 8;
                case  'African': return 9;
                case  'Island': return 10;
                case  'Hawaii': return 11;
                case  'Classical': return 12;
                case  'Spiritual Jazz': return 13;
                case  'Rock': return 14;
                case  'Reggae': return 15;
                case  'Library': return 16;
                case  'European': return 17;
                case  'Brazilian': return 18;
                case  'Japanese': return 19;
            }
        }
        return null;
    }
}
