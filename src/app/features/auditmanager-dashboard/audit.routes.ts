import { Routes } from '@angular/router';

export const auditRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./auditmanager-dashboard').then(c => c.AuditmanagerDashboard),
    children: [
      { path: '', redirectTo: 'EngagementContract', pathMatch: 'full' },

    ]
  }
];
