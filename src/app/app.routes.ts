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
  data: { roles: ['SECRETARY', 'AUDIT_MANAGER' , 'TECHNICAL_AUDITOR' ,   "ASSISTANT_TECHNICAL_AUDITOR" , "FIELD_AUDITOR" ,  "CONTACT_PERSON" , "QUALITY_CONTROL", "MANAGING_PARTNER", "REGULATORY_FILINGS_OFFICER", "ARCHIVE_OFFICER"] },
    loadChildren: () =>
      import('./features/secretary-dashboard/secretary.routes').then(r => r.SecretaryRoutes),
  },

  { path: '**', redirectTo: 'home' },
];
