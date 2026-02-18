import { Injectable } from '@angular/core';
import { HttpClient , HttpEvent, HttpEventType} from '@angular/common/http';
import { environment } from '../../../../../environment';
import { Observable } from 'rxjs';

export interface AccountGuide {
  id: number;
  level: string;
  accountNumber: number;
  accountName: string;
  rulesAndRegulations: string;
  disclosureNotes: string;
  code1: string;
  objectiveCode: string;
  relatedObjectives: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountguideService {
  private apiUrl = `${environment.apiUrl}/account-guide-templates`;

  constructor(private http: HttpClient) {}

 getAccountGuides(
  page: number = 1,
  perPage: number = 10,
  search: string = ''
): Observable<any> {
  return this.http.get(
    `${this.apiUrl}?page=${page}&limit=${perPage}&search=${encodeURIComponent(search)}`
  );
}

  deleteAccountGuide(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
createAccountGuide(data: Partial<AccountGuide>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  updateAccountGuide(id: number, body: any) {
  return this.http.put(`${this.apiUrl}/${id}`, body);
}
importAccountGuides(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/import`, formData, {
      reportProgress: true, // لتتبع التقدم
      observe: 'events'     // للحصول على كل الأحداث (progress, response)
    });
  }
  // === EXPORT ALL PDF ===
exportAllPDF() {
  return this.http.get(`${this.apiUrl}/export/pdf`, {
    responseType: 'blob'
  });
}

// === EXPORT ALL EXCEL ===
exportAllExcel() {
  return this.http.get(`${this.apiUrl}/export/excel`, {
    responseType: 'blob'
  });
}

exportSelectedPDF(id: number) {
  return this.http.get(`${this.apiUrl}/${id}/export/pdf`, {
    responseType: 'blob'
  });
}

exportSelectedExcel(id: number) {
  return this.http.get(`${this.apiUrl}/${id}/export/excel`, {
    responseType: 'blob'
  });
}


}
