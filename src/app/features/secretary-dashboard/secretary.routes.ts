import { Routes } from '@angular/router';

export const SecretaryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./secretary-dashboard').then(c => c.SecretaryDashboard),
    children: [
      { path: '', redirectTo: 'EngagementContract', pathMatch: 'full' },

      // 1. صفحة الجدول (القائمة)
      {
        path: 'EngagementContract',
        loadComponent: () =>
          import('./pages/secretary-engagement-contract/secretary-engagement-contract')
            .then(m => m.SecretaryEngagementContract)
      },

      // 2. صفحة التفاصيل (الجديدة)
      {
        path: 'EngagementContract/:id', 
        loadComponent: () =>
          import('./pages/secretary-engagement-contract-details/secretary-engagement-contract-details')
            .then(m => m.SecretaryEngagementContractDetailsComponent)
      }
    ]
  }
];
