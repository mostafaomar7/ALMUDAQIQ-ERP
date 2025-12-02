import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
 private api_url =  environment.apiUrl;
   constructor(private http: HttpClient) {}

   getSubscribersKpi(mode: 'day' | 'month' | 'year' | 'custom', date: string) {
  return this.http.get<any>(
    `${this.api_url}/kpi/subscribers/stats?mode=${mode}&date=${date}`
  );
}

 getSubscribers(page: number, limit: number) {
  return this.http.get<any>(
    `${this.api_url}/subscribers?page=${page}&limit=${limit}`
  );
}

}
