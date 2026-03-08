import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: ``,
})
export class HomeRedirectComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    const role = user?.role;

    if (role === 'ADMIN') this.router.navigateByUrl('/dashboard');
    else if (role === 'SUBSCRIBER_OWNER') this.router.navigateByUrl('/subscriber');
    else if (role === 'SECRETARY' || user?.role === 'AUDIT_MANAGER') this.router.navigateByUrl('/secretary');
    else this.router.navigateByUrl('/auth/login');
  }
}
