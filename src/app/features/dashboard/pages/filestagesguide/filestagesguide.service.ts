import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface fileGuide {
stageCode: string,
  stage:  string,
  entityType: string,
  economicSector: string,
  procedure: string  ,
  scopeOfProcedure: string ,
  selectionMethod: string,
  examplesOfUse: string,
  IAS:  string,
  IFRS: string,
  ISA: string,
  relevantPolicies: string,
  detailedExplanation: string,
  formsToBeCompleted: string,
  practicalProcedures:string,
  associatedRisks: string,
  riskLevel: string,
  responsibleAuthority: string,
  outputs:string,
  implementationPeriod: string,
  strengths: string,
  potentialWeaknesses: string,
  performanceIndicators: string ,
  selected?: boolean ,
  createdAt: string;
  updatedAt: string;
}
@Injectable({
  providedIn: 'root',
})
export class FilestagesguideService {
   private apiUrl = `${environment.apiUrl}/file-stages`;

  constructor(private http: HttpClient) {}

  getAccountGuides(): Observable<fileGuide[]> {
    return this.http.get<fileGuide[]>(this.apiUrl);
  }
  deleteAccountGuide(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
createAccountGuide(data: Partial<fileGuide>): Observable<any> {
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
