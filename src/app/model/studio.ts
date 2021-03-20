/**
 * Studio model object (used within frontend <=> backend communications).
 */
export class Studio {

    constructor(
        public name: string,
        public address: string,
        public lat: number,
        public lon: number,
        public comments?: string) { }

    _id: string | null = null;

}
