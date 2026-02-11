import { Routes } from '@angular/router';
// import { Dashboard } from './dashboard';
// import { Home } from './pages/home/home';
// import { Subscribers } from './pages/subscribers/subscribers';
// import { Complaints } from './pages/complaints/complaints';
// import { Activitylog } from './pages/activitylog/activitylog';
// import { Plansmanagement } from './pages/plansmanagement/plansmanagement';
// import { Domainsettings } from './pages/domainsettings/domainsettings';
// import { Accountsguide } from './pages/accountsguide/accountsguide';
// import { Reviewguide } from './pages/reviewguide/reviewguide';
// import { Filestagesguide } from './pages/filestagesguide/filestagesguide';
// import { Reviewobjectivesguide } from './pages/reviewobjectivesguide/reviewobjectivesguide';
// import { ReviewmarksindexComponent } from './pages/reviewmarksindex/reviewmarksindex';

export const SubscriberRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./subscriber-dashboard').then(c => c.SubscriberDashboard),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () =>
          import('./pages/subscriber-home/subscriber-home')
            .then(m => m.SubscriberHome)
      } ,
          {
        path: 'branches',
        loadComponent: () =>
          import('./pages/subscriber-branches/subscriber-branches')
            .then(m => m.SubscriberBranches)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/subscriber-users/subscriber-users')
            .then(m => m.SubscriberUsers)
      }
    ]
  }
];

