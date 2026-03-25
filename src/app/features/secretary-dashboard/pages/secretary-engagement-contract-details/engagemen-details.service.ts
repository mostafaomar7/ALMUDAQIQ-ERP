import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EngagemenDetails {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitContractReview(id: string, data: { status: string, comments: string }): Observable<any> {
    return this.http.patch(`${this.api_url}/engagement-contracts/${id}/review`, data);
  }

  getReviewGuides(contractId: string): Observable<any> {
    return this.http.get(`${this.api_url}/engagement-contracts/${contractId}/review-guides`);
  }

  getPendingGuides(contractId: string): Observable<any> {
    return this.http.get(`${this.api_url}/engagement-contracts/${contractId}/pending-guides`);
  }

  updateReviewGuideStatus(guideId: string, payload: any) {
    return this.http.patch(`${this.api_url}/contract-review-guides/${guideId}`, payload);
  }

  uploadReviewGuideDocument(guideId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('document', file);
    return this.http.post(`${this.api_url}/contract-review-guides/${guideId}/documents`, formData);
  }
  getEligibleStaff(contractId: string): Observable<any> {
    return this.http.get(`${this.api_url}/engagement-contracts/${contractId}/eligible-staff`);
  }

  assignStaff(contractId: string, payload: { userId: number, role: string }): Observable<any> {
    return this.http.post(`${this.api_url}/engagement-contracts/${contractId}/assign-staff`, payload);
  }

  // --- Trial Balance Endpoints ---
  getTrialBalance(contractId: string): Observable<any> {
    return this.http.get(`${this.api_url}/contracts/${contractId}/trial-balance`);
  }

  uploadTrialBalance(contractId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api_url}/contracts/${contractId}/trial-balance/upload`, formData);
  }

  exportTrialBalance(contractId: string): Observable<Blob> {
    return this.http.get(`${this.api_url}/contracts/${contractId}/trial-balance/export/excel`, {
      responseType: 'blob'
    });
  }
  // --- Financial Statements Endpoint ---
  exportFinancialStatementPdf(contractId: string): Observable<Blob> {
    return this.http.get(`${this.api_url}/contracts/${contractId}/trial-balance/export/pdf`, {
      responseType: 'blob'
    });
  }
}
