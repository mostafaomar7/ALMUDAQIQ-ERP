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

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard')
        .then(c => c.Dashboard),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },

      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home')
            .then(c => c.Home)
      },

      {
        path: 'subscribers',
        loadComponent: () =>
          import('./pages/subscribers/subscribers')
            .then(c => c.Subscribers)
      },

      {
        path: 'complaints',
        loadComponent: () =>
          import('./pages/complaints/complaints')
            .then(c => c.Complaints)
      },

      {
        path: 'activity',
        loadComponent: () =>
          import('./pages/activitylog/activitylog')
            .then(c => c.Activitylog)
      },

      {
        path: 'plansmanagements',
        loadComponent: () =>
          import('./pages/plansmanagement/plansmanagement')
            .then(c => c.Plansmanagement)
      },

      {
        path: 'settings/domain',
        loadComponent: () =>
          import('./pages/domainsettings/domainsettings')
            .then(c => c.Domainsettings)
      },

      {
        path: 'settings/accounts-guide',
        loadComponent: () =>
          import('./pages/accountsguide/accountsguide')
            .then(c => c.Accountsguide)
      },

      {
        path: 'settings/review-guide',
        loadComponent: () =>
          import('./pages/reviewguide/reviewguide')
            .then(c => c.Reviewguide)
      },

      {
        path: 'settings/file-stages-guide',
        loadComponent: () =>
          import('./pages/filestagesguide/filestagesguide')
            .then(c => c.Filestagesguide)
      },

      {
        path: 'settings/review-objectives-guide',
        loadComponent: () =>
          import('./pages/reviewobjectivesguide/reviewobjectivesguide')
            .then(c => c.Reviewobjectivesguide)
      },

      {
        path: 'settings/review-marks-index',
        loadComponent: () =>
          import('./pages/reviewmarksindex/reviewmarksindex')
            .then(c => c.ReviewmarksindexComponent)
      }
    ]
  }
];
