import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import {NotificationService} from "./notification.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private notificationService: NotificationService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError(async (err: HttpErrorResponse) => {
      //if the error object has a key which contains the word "error", and its value is an array then add the errors to the notification service
      if (err.error && typeof err.error === 'object' && Object.keys(err.error).some(key => key.toLowerCase().includes('error'))) {
        const errors = Object.values(err.error).flat();
        errors.forEach(error => this.notificationService.add({
          severity: 'error',
          title: 'Error',
          message: error?.toString() ?? 'An error occurred',
          autoClose: true
        }));
      }
      throw err;
    }));

  }
}
