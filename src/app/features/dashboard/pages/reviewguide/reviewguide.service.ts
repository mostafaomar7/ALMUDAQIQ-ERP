import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface reviewGuide {
  id: number;
  level: string;
  separator: string;
  number: string;
  statement: string;
  purpose: string;

  responsiblePerson: string;
  datePrepared: string;
  dateReviewed: string;
  conclusion: string;
  attachments: string;
  notes1: string;
  notes2: string;
  notes3: string;

  selected?: boolean; // نجعلها اختيارية لأن الباكيند لا يرسلها
}

@Injectable({
  providedIn: 'root',
})
export class ReviewguideService {
  private apiUrl = `${environment.apiUrl}/review-guides`;

  constructor(private http: HttpClient) {}

  getAccountGuides(): Observable<reviewGuide[]> {
    return this.http.get<reviewGuide[]>(this.apiUrl);
  }
  deleteAccountGuide(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
createAccountGuide(data: Partial<reviewGuide>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
updateAccountGuide(id: number, body: any) {
  return this.http.put(`${this.apiUrl}/${id}`, body);
}

iimportReviewGuides(file: File): Observable<HttpEvent<any>> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<any>(`${this.apiUrl}/import`, formData, {
    reportProgress: true,
    observe: 'events'
  });
}

exportAllPDF() { return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' }); }
exportAllExcel() { return this.http.get(`${this.apiUrl}/export/excel`, { responseType: 'blob' }); }
exportSelectedPDF(id: number) { return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' }); }
exportSelectedExcel(id: number) { return this.http.get(`${this.apiUrl}/${id}/export/excel`, { responseType: 'blob' }); }


}
