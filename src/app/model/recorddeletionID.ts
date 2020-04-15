/**
 * ID used for record deletion queries (includes a style id and a record id).
 */
export class RecordDeletionID {

    constructor(
        public style: number,
        public ID: string) { }

    /**
     * Builds params for an HTTP query string.
     */
    public getParamsForHTTPQueryString(): string {
        return '?Style=' + ((this.style !== null) ? this.style.toString() : '') + '&ID=' + this.ID;
    }
}
