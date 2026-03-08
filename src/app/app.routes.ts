import { Routes } from '@angular/router';
import { AuthGuard } from './features/dashboard/guard/auth.guard';
import { GuestGuard } from './features/auth/guard/guest.guard';
import { HomeRedirectComponent } from './home-redirect.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    canActivate: [AuthGuard],
    component: HomeRedirectComponent,
  },

  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES),
  },

  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(r => r.dashboardRoutes),
  },

  {
    path: 'subscriber',
    canActivate: [AuthGuard],
    data: { roles: ['SUBSCRIBER_OWNER'] },
    loadChildren: () =>
      import('./features/subscriber-dashboard/subscriber.routes').then(r => r.SubscriberRoutes),
  },

  {
    path: 'secretary',
    canActivate: [AuthGuard],
  data: { roles: ['SECRETARY', 'AUDIT_MANAGER'] },
    loadChildren: () =>
      import('./features/secretary-dashboard/secretary.routes').then(r => r.SecretaryRoutes),
  },

  { path: '**', redirectTo: 'home' },
];
