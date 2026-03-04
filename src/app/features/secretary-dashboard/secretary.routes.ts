import { Routes } from '@angular/router';


export const SecretaryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./secretary-dashboard').then(c => c.SecretaryDashboard),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

    ]
  }
];

