import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ticket {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createComplaint(body: any): Observable<any> {
    return this.http.post(`${this.api_url}/complaints`, body);
  }

  getMyTickets(): Observable<any> {
    return this.http.get(`${this.api_url}/complaints/mine`);
  }
}
