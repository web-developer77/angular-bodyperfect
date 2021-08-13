import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '@app/auth';

@Injectable()
export class HttpsetheaderInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let authService = this.injector.get(AuthenticationService);
    let clonnedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });
    return next.handle(clonnedRequest);
    // return next.handle(request);
  }
}
