import { environment } from './../../../../../environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KpiServiceTs {
  private api_url = environment.apiUrl;
  private http = inject(HttpClient); // حقن HttpClient

  getSubscriberStats(): Observable<any> {
    return this.http.get(`${this.api_url}/kpi/subscriber-stats`);
  }
   getEngagementContracts(): Observable<any> {
    return this.http.get<any>(`${this.api_url}/engagement-contracts`);
  }
}
