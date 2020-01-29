/**
 * Class used to post a Record to the backend.
 */
import {Record} from '../model/record';
export class RecordPost {

    constructor(
        public style: number,
        public record: Record) {}
}
