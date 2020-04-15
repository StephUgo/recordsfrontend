import { RecordDeletionID } from './recorddeletionID';

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
        public ImageFileName: string,
        public Comments: string) { }

    public _id: string;

    /**
     * Set the style string value from the style numeric id.
     */
    public setStyleFromStyleId(styleId: number) {
        if (styleId !== null) {
            switch (styleId) {
                case 1: this.Style = 'Soul/Funk';
                break;
                case 2: this.Style = 'Rap';
                break;
                case 3: this.Style =  'Jazz';
                break;
                case 4: this.Style =  'Soundtracks';
                break;
                case 5: this.Style =  'Misc';
                break;
                case 6: this.Style =  'AOR';
                break;
                case 7: this.Style =  'Audiophile';
                break;
                case 8: this.Style =  'Latin';
                break;
                case 9: this.Style =  'African';
                break;
                case 10: this.Style =  'Island';
                break;
                case 11: this.Style =  'Hawaii';
                break;
                case 12: this.Style =  'Classical';
                break;
                case 13: this.Style =  'Spiritual Jazz';
                break;
                case 14: this.Style =  'Rock';
                break;
                case 15: this.Style =  'Reggae';
                break;
                case 16: this.Style =  'Library';
                break;
                case 17: this.Style =  'European';
                break;
                case 18: this.Style =  'Brazilian';
                break;
                case 19: this.Style =  'Japanese';
                break;
                case 20: this.Style =  'Electro';
                break;
                case 21: this.Style =  'Brit Funk';
                break;
            }
        }
    }
}
