import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  const tenant = authService.getTenant();

  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
const user = authService.getUser();
const role = user?.role;

if (tenant && role !== 'ADMIN') headers['x-tenant'] = tenant;

  if (Object.keys(headers).length) req = req.clone({ setHeaders: headers });

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

