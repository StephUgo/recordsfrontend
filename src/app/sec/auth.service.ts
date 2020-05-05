import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, map } from 'rxjs/operators';
import * as moment from 'moment';
import { User } from '../users/user.model';
import { environment } from '../../environments/environment';

const backendServerURL = environment.backendURL + ':' + environment.backendPort;
const usersBackendURLPrefix = backendServerURL + '/users/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) {
    }

    /**
     * Login service (calls the NodeJS Backend associated service)
     * If ok, the JWT token is stored in the local storage.
     * @param user user to log in
     */
    login(user: User) {
        return this.http.post(usersBackendURLPrefix + 'login', user).pipe(map(this.setSession)
        ).pipe(shareReplay());
    }

    /**
     * Registration service (calls the NodeJS Backen associated service)
     * @param user user to register
     */
    register(user: User) {
        return this.http.post(usersBackendURLPrefix + 'register', user);
    }

    /**
     * Logout service (local for the moment)
     */
    logout() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
    }

    setSession(authResult: any) {
        const expiresAt = moment().add(authResult.expiresIn, 'second');

        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
    }

    isLoggedIn() {
        const expiration = localStorage.getItem('expires_at');
        if (expiration !== null) {
            return moment().isBefore(this.getExpiration(expiration));
        } else {
            return false;
        }
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

    private getExpiration(expiration: string) {
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }
}
