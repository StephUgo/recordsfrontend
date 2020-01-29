/**
 * Record model object.
 */
export class Record {

    constructor(
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
}
