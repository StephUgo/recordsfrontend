import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, takeUntil, map } from 'rxjs/operators';
import * as moment from 'moment';
import { User } from '../users/user.model';

const usersBackendURLPrefix = 'http://localhost:3000/users/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) {
    }

    /**
     * Login service (calls the NodeJS Backen associated service)
     * If ok, the JWT token is stored in the local storage.
     * @param user user to log in
     */
    public login(user: User) {
        return this.http.post(usersBackendURLPrefix + 'login', user).pipe(map(this.setSession)
        ).pipe(shareReplay());
    }

    /**
     * Registration service (calls the NodeJS Backen associated service)
     * @param user user to log in
     */
    public register(user: User) {
        return this.http.post(usersBackendURLPrefix + 'register', user);
    }

    /**
     * Logout service (local for the moment)
     */
    public logout() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
    }

    private setSession(authResult) {
        const expiresAt = moment().add(authResult.expiresIn, 'second');

        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
    }

    public isLoggedIn() {
        return moment().isBefore(this.getExpiration());
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

    getExpiration() {
        const expiration = localStorage.getItem('expires_at');
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }
}
