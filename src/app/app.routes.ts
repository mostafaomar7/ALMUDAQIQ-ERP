import { Routes } from '@angular/router';
// import { AUTH_ROUTES } from './features/auth/auth.routes';
// import { dashboardRoutes } from './features/dashboard/dashboard.routes';
import { AuthGuard } from './features/dashboard/guard/auth.guard';
import { GuestGuard } from './features/auth/guard/guest.guard';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(r => r.AUTH_ROUTES)
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes')
        .then(r => r.dashboardRoutes)
  },
  {
    path: 'subscriber',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/subscriber-dashboard/subscriber.routes')
        .then(r => r.SubscriberRoutes)
  },

  { path: '**', redirectTo: '' }
];
