import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environment';
import { jwtDecode } from 'jwt-decode';
import { TenantService } from './TenantService';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // عدّل الـ baseApiUrl حسب الـ backend عندك
    private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient , private tenantSvc: TenantService) {}

login(email: string, password: string): Observable<any> {
  const isAdminEmail = email.toLowerCase().endsWith('@erp.com');

  // tenant افتراضي للتيست
  const tenant = isAdminEmail ? null : environment.defaultTenant;

  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  if (tenant) {
    headers = headers.set('x-tenant', tenant);
    localStorage.setItem('tenant', tenant);
  } else {
    localStorage.removeItem('tenant'); // ✅ عشان interceptor مايبعتوش
  }

  return this.http.post<any>(
    `${this.baseUrl}/auth/login`,
    { email, password },
    { headers }
  ).pipe(
    tap(res => {
      if (res?.token) localStorage.setItem('accessToken', res.token);
      if (res?.user) localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('mustChangePassword', String(!!res?.mustChangePassword));

    })
  );
}
getUser(): any | null {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

mustChangePassword(): boolean {
  return localStorage.getItem('mustChangePassword') === 'true';
}
logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');
  localStorage.removeItem('mustChangePassword'); // ✅
}

requestPasswordReset(email: string): Observable<any> {

  const isAdminEmail = email.toLowerCase().endsWith('@erp.com');

  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  if (!isAdminEmail) {
    headers = headers.set('x-tenant', environment.defaultTenant); // bayomyv-2
  }

  return this.http.post(
    `${this.baseUrl}/auth/send-otp`,
    { email },
    { headers }
  );
}

resetPassword(email: string, otp: string, newPassword: string): Observable<any> {

  const isAdminEmail = email.toLowerCase().endsWith('@erp.com');

  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  if (!isAdminEmail) {
    headers = headers.set('x-tenant', environment.defaultTenant);
  }

  return this.http.post(
    `${this.baseUrl}/auth/reset-password`,
    { email, otp, newPassword },
    { headers }
  );
}


verifyEmailWithEmail(email: string, otp: string): Observable<any> {

  const isAdminEmail = email.toLowerCase().endsWith('@erp.com');

  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  if (!isAdminEmail) {
    headers = headers.set('x-tenant', environment.defaultTenant);
  }

  return this.http.post(
    `${this.baseUrl}/auth/verify-otp`,
    { email, otp },
    { headers }
  );
}

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
getTenant(): string | null {
  return localStorage.getItem('tenant');
}

  // optional: helper to know if logged in
isLoggedIn(): boolean {
  const token = this.getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      this.logout();
      return false;
    }

    return true;
  } catch (e) {
    this.logout();
    return false;
  }
}
changePassword(oldPassword: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/change-password`, {
    oldPassword,
    newPassword
  });
}

}
