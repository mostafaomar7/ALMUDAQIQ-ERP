// src/app/features/dashboard/pages/reviewobjectives/reviewobjectives.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environment';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewObjectives {
  id?: number; // optional because create may not have id
  codesCollected: string;
  ethicalCompliancePercentage: number | null;
  professionalPlanningPercentage: number | null;
  internalControlPercentage: number | null;
  evidencePercentage: number | null;
  evaluationPercentage: number | null;
  documentationPercentage: number | null;
  actualPerformance: number | null;
  implementationStatus: string;
  codeOfEthics: string;
  policies: string;
  ifrs: string;
  ias: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewobjectivesService {
  private apiUrl = `${environment.apiUrl}/review-objective-stages`;

  constructor(private http: HttpClient) {}

  getReviewObjectives(): Observable<ReviewObjectives[]> {
    return this.http.get<ReviewObjectives[]>(this.apiUrl);
  }

  deleteReviewObjectives(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createReviewObjectives(data: Partial<ReviewObjectives>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateReviewObjectives(id: number, body: any) {
    return this.http.put(`${this.apiUrl}/${id}`, body);
  }

  iimportReviewObjectives(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  exportAllPDF() {
    return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' });
  }
  exportAllExcel() {
    return this.http.get(`${this.apiUrl}/all/export/excel`, { responseType: 'blob' });
  }
  exportSelectedPDF(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' });
  }
  exportSelectedExcel(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/export/excel`, { responseType: 'blob' });
  }
}
