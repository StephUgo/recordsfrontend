import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, takeUntil, map } from 'rxjs/operators';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) {
    }

    login(name: string, email: string, password: string ) {
        return this.http.post('http://localhost:3000/users/login', {name, email, password}).pipe(
            map(this.setSession)
        ).pipe(shareReplay());
    }

    register(name: string, email: string, password: string ) {
        return this.http.post('http://localhost:3000/users/register', {name, email, password});
    }

    private setSession(authResult) {
        const expiresAt = moment().add(authResult.expiresIn, 'second');

        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()) );
    }

    logout() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
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
