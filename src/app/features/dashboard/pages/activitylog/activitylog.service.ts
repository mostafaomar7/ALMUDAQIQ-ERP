import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class ActivitylogService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getActivityLogs() {
    return this.http.get<any>(`${this.api_url}/activity-logs`);
  }
}
