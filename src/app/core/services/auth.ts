import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // عدّل الـ baseApiUrl حسب الـ backend عندك
  private baseUrl = 'https://api.example.com/auth';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ accessToken: string, user: any }> {
    return this.http.post<{ accessToken: string, user: any }>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res?.accessToken) {
            localStorage.setItem('accessToken', res.accessToken);
            localStorage.setItem('user', JSON.stringify(res.user || {}));
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, password: newPassword });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-email`, { token });
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // optional: helper to know if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
