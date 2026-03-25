import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/send-otp') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/verify-otp');

  const token = authService.getToken();
  const tenant = authService.getTenant();

  const headers: any = {};

  if (token && !isAuthRequest) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (tenant && !isAuthRequest) {
    headers['x-tenant'] = tenant;
  }

  if (Object.keys(headers).length) {
    req = req.clone({ setHeaders: headers });
  }

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
