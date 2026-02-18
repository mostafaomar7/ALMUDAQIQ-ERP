import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // 1) لازم يكون logged in
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login']);
    }

    const user = this.auth.getUser();
    const role = user?.role; // 'ADMIN' أو 'SUBSCRIBER_OWNER'...
    const mustChange = this.auth.mustChangePassword();

    const url = state.url; // المسار اللي رايحله المستخدم
 
    // 2) لو subscriber لازم يغير باسورد: امنعه من أي route غير change-password
    if (role !== 'ADMIN' && mustChange) {
      if (!url.startsWith('/auth/change-password')) {
        return this.router.createUrlTree(['/auth/change-password']);
      }
      return true; // مسموح فقط هنا
    }

    // 3) توجيه حسب الدور (اختياري بس مفيد)
    // لو Admin حاول يفتح subscriber → رجّعه dashboard
    if (role === 'ADMIN' && url.startsWith('/subscriber')) {
      return this.router.createUrlTree(['/dashboard']);
    }

    // لو Subscriber حاول يفتح dashboard → رجّعه subscriber
    if (role !== 'ADMIN' && url.startsWith('/dashboard')) {
      return this.router.createUrlTree(['/subscriber']);
    }

    return true;
  }
}
