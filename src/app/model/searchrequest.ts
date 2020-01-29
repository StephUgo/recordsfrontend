/**
 * Search request model object.
 */
export class SearchRequest {

    constructor(
        public Style: number,
        public Artiste: string,
        public Titre: string,
        public Format: string,
        public Label: string,
        public Country: string,
        public Year: number,
        public Period: string,
        public Sort: number,
        public Limit: number,
        public Skip: number) {}
}
