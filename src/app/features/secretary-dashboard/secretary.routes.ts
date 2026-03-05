import { Routes } from '@angular/router';


export const SecretaryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./secretary-dashboard').then(c => c.SecretaryDashboard),
    children: [
      { path: '', redirectTo: 'EngagementContract', pathMatch: 'full' },
 {
        path: 'EngagementContract',
        loadComponent: () =>
          import('./pages/secretary-engagement-contract/secretary-engagement-contract')
            .then(m => m.SecretaryEngagementContract)
      },
    ]
  }
];

