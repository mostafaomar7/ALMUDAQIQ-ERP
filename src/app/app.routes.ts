import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'auth', children: AUTH_ROUTES },
  { path: 'dashboard', children: dashboardRoutes },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
