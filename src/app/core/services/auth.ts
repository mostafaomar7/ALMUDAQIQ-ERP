import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // عدّل الـ baseApiUrl حسب الـ backend عندك
    private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password })
    .pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem('accessToken', res.token);
        }
      })
    );
}


  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/send-otp`, { email });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/reset-password`, {
    email,
    otp,
    newPassword
  });
}

verifyEmailWithEmail(email: string, otp: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/auth/verify-otp`, { email, otp }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // optional: helper to know if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}
