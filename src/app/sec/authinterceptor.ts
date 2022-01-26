import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService) { }

    /**
     * Interceptor which add the user token (if any) to HTTP request
     * @param req HTTP request
     * @param next next HTTP handler
     */
    public intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = localStorage.getItem('id_token');

        if (idToken) {
            if (this.authService.isLoggedOut()) {
                this.authService.logout();
                return next.handle(req);
            } else {
                const cloned = req.clone({
                    headers: req.headers.set('authorization', idToken)
                });
                return next.handle(cloned);
            }
        } else {
            return next.handle(req);
        }
    }
}
