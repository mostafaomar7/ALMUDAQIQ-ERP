import { environment } from './../../../../../environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileUser {
  private http = inject(HttpClient);
  private apiUrl =  environment.apiUrl

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/auth/profile`, data);
  }
}
