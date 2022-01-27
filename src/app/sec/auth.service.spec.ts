// Other imports
import { AuthService } from './auth.service';
import { asyncData } from '../../testing/async-observable-helpers';
import { User } from '../users/user.model';

describe('Service "AuthService" testing', () => {
    let httpClientSpy: { post: jasmine.Spy; get: jasmine.Spy };
    let authService: AuthService;

    beforeEach(() => {
        // Inject the http client spy for the test
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
        authService = new AuthService(<any> httpClientSpy);
    });

    it('Test register(User).', () => {
        const testUser: User = { name: 'test', email: 'test@test.com', password: 'test'};
        const expectedOKResult = { status: 200 };

        httpClientSpy.post.and.returnValue(asyncData(expectedOKResult));

        authService.register(testUser).subscribe(
            result => expect(result).toEqual(expectedOKResult, 'expected result'),
            fail
        );

        expect(httpClientSpy.post.calls.count()).toBe(1, 'one call');
    });
});
