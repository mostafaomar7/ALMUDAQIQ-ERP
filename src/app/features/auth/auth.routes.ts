import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { ForgotRequest } from './pages/forgot-request/forgot-request';
import { ResetPassword } from './pages/reset-password/reset-password';
import { VerifyEmail } from './pages/verify-email/verify-email';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotRequest },
  // رابط يُرسل في الإيميل: /auth/reset-password?token=XYZ
  { path: 'reset-password', component: ResetPassword },
  // رابط التأكيد في الإيميل: /auth/verify-email?token=ABC
  { path: 'verify-email', component: VerifyEmail }
];
