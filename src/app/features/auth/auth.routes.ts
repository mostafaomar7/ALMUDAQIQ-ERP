import { Routes } from '@angular/router';
// import { Login } from './pages/login/login';
// import { ForgotRequest } from './pages/forgot-request/forgot-request';
// import { ResetPassword } from './pages/reset-password/reset-password';
// import { VerifyEmail } from './pages/verify-email/verify-email';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login')
        .then(c => c.Login)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-request/forgot-request')
        .then(c => c.ForgotRequest)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password')
        .then(c => c.ResetPassword)
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./pages/verify-email/verify-email')
        .then(c => c.VerifyEmail)
  }
];
