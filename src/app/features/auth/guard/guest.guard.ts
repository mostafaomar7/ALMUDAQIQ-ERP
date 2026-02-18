import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // لو مش عامل login → تمام يدخل صفحات auth
    if (!this.auth.isLoggedIn()) return true;

    const url = state.url;

    // ✅ استثناء: لو داخل change-password (ومحتاج يغير) اسمح
    const user = this.auth.getUser();
    const role = user?.role;
    const mustChange = this.auth.mustChangePassword();

    if (url.startsWith('/auth/change-password')) {
      if (role !== 'ADMIN' && mustChange) return true;
      // لو مش محتاج يغير أو admin → مايدخلش هنا
      return role === 'ADMIN'
        ? this.router.createUrlTree(['/dashboard'])
        : this.router.createUrlTree(['/subscriber']);
    }

    // باقي صفحات auth: طالما logged in رجّعه على مكانه
    return role === 'ADMIN'
      ? this.router.createUrlTree(['/dashboard'])
      : this.router.createUrlTree(['/subscriber']);
  }
}
