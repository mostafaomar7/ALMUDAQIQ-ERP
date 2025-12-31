import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class DomainService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addCountry(body: any) {
    return this.http.post(`${this.api_url}/countries`, body);
  }

  addCity(body: any) {
    return this.http.post(`${this.api_url}/cities`, body);
  }

  addRegion(body: any) {
    return this.http.post(`${this.api_url}/regions`, body);
  }
    getCountries() {
    return this.http.get(`${this.api_url}/countries`);
  }
getCitiesByCountry(countryId: number) {
  return this.http.get<any[]>(`${this.api_url}/cities?countryId=${countryId}`);
}

getRegionsByCity(cityId: number) {
  return this.http.get<any[]>(`${this.api_url}/regions?cityId=${cityId}`);
}
getStatesByCountry(countryId: number) {
  return this.http.get<any[]>(`${this.api_url}/states?countryId=${countryId}`);
}

getCitiesByState(stateId: number) {
  return this.http.get<any[]>(`${this.api_url}/cities?stateId=${stateId}`);
}
deleteCities(cityId: number) {
  return this.http.delete(`${this.api_url}/cities/${cityId}`);
}
}
