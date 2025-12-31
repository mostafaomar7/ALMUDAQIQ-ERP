import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { AuthGuard } from './features/dashboard/guard/auth.guard';
import { GuestGuard } from './features/auth/guard/guest.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // root يذهب لـ dashboard
  {
    path: 'auth',
    canActivate: [GuestGuard], // إذا مسجل دخول، يمنع الوصول
    children: AUTH_ROUTES
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard], // إذا لم يسجل دخول، يمنع الوصول
    children: dashboardRoutes
  },
  { path: '**', redirectTo: '', pathMatch: 'full' } // fallback
];
