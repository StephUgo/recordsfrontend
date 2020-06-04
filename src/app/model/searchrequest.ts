/**
 * Search request model object.
 */
export class SearchRequest {

    constructor(
        public Style: number | null,
        public Artiste: string | null,
        public Titre: string | null,
        public Format: string | null,
        public Label: string | null,
        public Country: string | null,
        public Year: number | null,
        public Period: string | null,
        public Keywords: string | null,
        public Sort: number | null,
        public Limit: number | null,
        public Skip: number | null) {}
}
