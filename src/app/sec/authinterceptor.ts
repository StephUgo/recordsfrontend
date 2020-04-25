import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    /**
     * Interceptor which add the user token (if any) to HTTP request
     * @param req HTTP request
     * @param next next HTTP handler
     */
    public intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = localStorage.getItem('id_token');

        if (idToken) {
            const cloned = req.clone({
                headers: req.headers.set('authorization', idToken)
            });

            return next.handle(cloned);
        } else {
            return next.handle(req);
        }
    }
}
