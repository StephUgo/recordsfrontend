import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user.model';
import { shareReplay, takeUntil } from 'rxjs/operators';

@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {
    }

    login(email: string, password: string ) {
        return this.http.post<User>('/api/login', {email, password}).pipe(shareReplay());
            // this is just the HTTP call,
            // we still need to handle the reception of the token
    }
}
