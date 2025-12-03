import { HttpClient } from '@angular/common/http';
import { environment } from './../../../../../environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
 private api_url =  environment.apiUrl;
   constructor(private http: HttpClient) {}

getSubscribersKpi(params: any) {
  return this.http.get<any>(`${this.api_url}/kpi/subscribers/stats`, { params });
}

getSubscribersFile(params: any) {
 return this.http.get<any>(`${this.api_url}/kpi/files/stats`, { params });
}

getSubscriberscomplaints(params: any) {
  return this.http.get<any>(`${this.api_url}/kpi/complaints/stats`, { params });
}

 getSubscribers(page: number, limit: number) {
  return this.http.get<any>(
    `${this.api_url}/subscribers?page=${page}&limit=${limit}`
  );
}
getProfits(year?: number) {
  if (year) {
    return this.http.get<any>(`${this.api_url}/kpi/profits`, { params: { year } });
  } else {
    return this.http.get<any>(`${this.api_url}/kpi/profits/yearly`);
  }
}


}
