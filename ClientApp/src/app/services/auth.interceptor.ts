import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {LocalstoreService} from "./localstore.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private localStore: LocalstoreService) {
  }

  /**
   * Intercepts all requests and adds the token to the header if it exists.
   * If the server returns a 401, the token is removed from the local storage
   * @param req
   * @param next
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.localStore.get('token');
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Token ${token}`)
      });
      return next.handle(authReq).pipe(
        tap({
            next: () => {
            }, error: (err: any) => {
              if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                  this.localStore.remove('token');
                }
              }
            }
          }
        )
      );
    }
    return next.handle(req);
  }
}
