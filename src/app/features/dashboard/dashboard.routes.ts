import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';
import { Home } from './pages/home/home';
import { Subscribers } from './pages/subscribers/subscribers';
import { Complaints } from './pages/complaints/complaints';
import { Activitylog } from './pages/activitylog/activitylog';
import { Plansmanagement } from './pages/plansmanagement/plansmanagement';
import { Domainsettings } from './pages/domainsettings/domainsettings';
import { Accountsguide } from './pages/accountsguide/accountsguide';
import { Reviewguide } from './pages/reviewguide/reviewguide';
import { Filestagesguide } from './pages/filestagesguide/filestagesguide';
import { Reviewobjectivesguide } from './pages/reviewobjectivesguide/reviewobjectivesguide';
import { Reviewmarksindex } from './pages/reviewmarksindex/reviewmarksindex';

export const dashboardRoutes: Routes = [
  {
    path: '', // هذا يعني /dashboard
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'subscribers', component: Subscribers },
      { path: 'complaints', component: Complaints },
      { path: 'activity', component: Activitylog },
      { path: 'plansmanagements', component: Plansmanagement },
      { path: 'settings/domain', component: Domainsettings },
      { path: 'settings/accounts-guide', component: Accountsguide },
      { path: 'settings/review-guide', component: Reviewguide },
      { path: 'settings/file-stages-guide', component: Filestagesguide },
      { path: 'settings/review-objectives-guide', component: Reviewobjectivesguide },
      { path: 'settings/review-marks-index', component: Reviewmarksindex },
    ]
  }
];
