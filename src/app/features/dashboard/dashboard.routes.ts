import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Home } from './pages/home/home';
import { Subscribers } from './pages/subscribers/subscribers';

export const dashboardRoutes: Routes = [
  {
    path: '', // هذا يعني /dashboard
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'subscribers', component: Subscribers },
    ]
  }
];
