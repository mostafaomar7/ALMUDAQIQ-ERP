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
  path: 'branches-details/:id',
  loadComponent: () =>
    import('./pages/subscriber-branch-details/subscriber-branch-details')
      .then(m => m.SubscriberBranchDetails)
},
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/subscriber-users/subscriber-users')
            .then(m => m.SubscriberUsers)
      },
       {
  path: 'users-details/:id',
  loadComponent: () =>
    import('./pages/subscriber-user-details/subscriber-user-details')
      .then(m => m.SubscriberUserDetails)
}, 
        {
        path: 'profile',
        loadComponent: () =>
          import('./pages/subscriber-profile/subscriber-profile')
            .then(m => m.SubscriberProfile)
      },
      {
        path: 'upgrade',
        loadComponent: () =>
          import('./pages/subscriber-profile/upgrade-plan/upgrade-plan')
            .then(m => m.UpgradePlan)
      },
      {
        path: 'accountguide',
        loadComponent: () =>
          import('./pages/accountsguide/accountsguide')
            .then(m => m.Accountsguide)
      },
       {
        path: 'reviewguide',
        loadComponent: () =>
          import('./pages/reviewguide/reviewguide')
            .then(m => m.Reviewguide)
      },
      {
        path: 'filestage',
        loadComponent: () =>
          import('./pages/filestagesguide/filestagesguide')
            .then(m => m.Filestagesguide)
      },
       {
        path: 'reviewobjectivesguide',
        loadComponent: () =>
          import('./pages/reviewobjectivesguide/reviewobjectivesguide')
            .then(m => m.Reviewobjectivesguide)
      },
      {
        path: 'reviewmarksindex',
        loadComponent: () =>
          import('./pages/reviewmarksindex/reviewmarksindex')
            .then(m => m.ReviewmarksindexComponent)
      }
    ]
  }
];

