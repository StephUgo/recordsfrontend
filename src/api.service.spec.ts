// Other imports
import { ApiService } from './api.service';
import { Record } from './app/model/record';
import { asyncData } from './testing/async-observable-helpers';
import { RecordUtils } from './app/recordutils';

describe('Service "ApiService" testing', () => {
    let httpClientSpy: { get: jasmine.Spy };
    let apiService: ApiService;
    let recordutils: RecordUtils;

    beforeEach(() => {
        // Inject the http client spy for the test
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        apiService = new ApiService(<any> httpClientSpy, recordutils);
    });

    it('Test getRecords().', () => {
        const expectedRecords: Record[] = [
            {_id: '5eb529a0d8f6ed6c10dff8d6', Style: 'Jazz', Artist: 'Green, Grant',
                Title: 'Idle Moments', Format: 'LP', Country: 'US',
                Reference: 'MMBST-84154', Comments: 'Recorded At – Van Gelder Studio, Englewood Cliffs, NJ',
                ImageFileName: 'GreenIdleMoments.jpg', Label: 'Blue Note - Music Matters',
                Period: '60\'s', Year: 2014, keywords: ['Audiophile', 'Pressed at RTI'],
                copyFrom: Record.prototype.copyFrom}];

        httpClientSpy.get.and.returnValue(asyncData(expectedRecords));

        apiService.getRecords().subscribe(
            records => expect(records).toEqual(expectedRecords, 'expected records'),
            fail
        );

        expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
    });
});
