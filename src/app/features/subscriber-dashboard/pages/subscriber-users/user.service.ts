import { environment } from './../../../../../environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api_url = environment.apiUrl;

  // حقن HttpClient
  constructor(private http: HttpClient) {}

  // دالة إضافة مستخدم جديد
  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.api_url}/users`, userData);
  }
  getBranches(): Observable<any> {
  return this.http.get(`${this.api_url}/api/branches`);
}
// أضف هذه الدالة داخل UserService
getUsers(): Observable<any> {
  return this.http.get(`${this.api_url}/users`);
}
updateUser(id: number, userData: any): Observable<any> {
  return this.http.put(`${this.api_url}/users/${id}`, userData);
}
}
