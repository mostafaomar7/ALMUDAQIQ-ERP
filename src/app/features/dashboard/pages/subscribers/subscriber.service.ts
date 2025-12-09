// src/app/core/services/subscriber.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class SubscriberService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

getSubscribers(page: number, limit: number, search: string = '', filters: any = {}) {
  return this.http.get<any>(`${this.api_url}/subscribers`, {
    params: {
      page,
      limit,
      search,
      countryId: filters.countryId || '',
      cityId: filters.cityId || '',
      regionId: filters.regionId || '',
      status: filters.status || '',
      newDays: filters.newSubscribersDays || '',
      endDays: filters.endingSubscriptionDays || ''
    }
  });
}

createSubscriber(data: FormData): Observable<any> {
  return this.http.post(`${this.api_url}/subscribers`, data);
}
updateSubscriber(id: number, data: FormData) {
  return this.http.patch(`${this.api_url}/subscribers/${id}`, data);
}
// src/app/core/services/subscriber.service.ts
updateSubscriberStatus(id: number, status: string) {
  return this.http.patch(`${this.api_url}/subscribers/${id}/status`, { status });
}

getCountries() {
  return this.http.get<any[]>(`${this.api_url}/countries`);
}

getCitiesByCountry(countryId: number) {
  return this.http.get<any[]>(`${this.api_url}/cities?countryId=${countryId}`);
}

getRegionsByCity(cityId: number) {
  return this.http.get<any[]>(`${this.api_url}/regions?cityId=${cityId}`);
}
getRenwalSubscribers(page: number, limit: number, search: string = '') {
  return this.http.get<any>(`${this.api_url}/reports/renewal-status`, {
    params: {
      page,
      limit,
      search
    }
  });
}
getCountryById(countryId: number) {
  return this.http.get<any>(`${this.api_url}/countries/${countryId}`);
}
getPlans() {
    return this.http.get(`${this.api_url}/plans`);
  }
  exportExcel(): Observable<Blob> {
  return this.http.get(`${this.api_url}/subscribers/export/excel`, {
    responseType: 'blob'
  });
}

exportPDF(): Observable<Blob> {
  return this.http.get(`${this.api_url}/subscribers/export/pdf`, {
    responseType: 'blob'
  });
}

}
