import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    const user = this.auth.getUser();
    const role: string = user?.role;
    const mustChange = this.auth.mustChangePassword();
    const url = state.url;

    // لازم يغير باسورد (لغير ADMIN)
    if (role !== 'ADMIN' && mustChange) {
      if (!url.startsWith('/auth/change-password')) {
        return this.router.createUrlTree(['/auth/change-password']);
      }
      return true;
    }

    // منع الدخول حسب roles في data
    const allowedRoles: string[] = route.data?.['roles'] ?? [];
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return this.router.createUrlTree([this.getHomeByRole(role)]);
    }

    return true;
  }

  private getHomeByRole(role: string): string {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'SUBSCRIBER_OWNER') return '/subscriber';
  if (role === 'SECRETARY' || role === 'AUDIT_MANAGER' || role == 'TECHNICAL_AUDITOR'
    || role ===   "ASSISTANT_TECHNICAL_AUDITOR" || role === "FIELD_AUDITOR" || role ===  "CONTACT_PERSON"
  ) return '/secretary';
  return '/auth/login';
}
}
