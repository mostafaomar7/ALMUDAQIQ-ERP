import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environment';

export interface Reviewmarksindex {
  id?: number;
  codeImage: string;
  name: string;
  shortDescription: string;
  suggestedStage: string;
  whenToUse: string;
  exampleShortForm: string;
  sectorTags: string;
  assertion: string;
  benchmark: string;
  scoreWeight: number;
  severityLevel: number;
  severityWeight: number;
  priorityRating: string;
  selected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReviewmarksindexService {
  private apiUrl = `${environment.apiUrl}/review-marks-index`;

  constructor(private http: HttpClient) {}

 getReviewmarksindex(
  page: number,
  limit: number,
  search?: string
): Observable<any> {
  let params: any = { page, limit };
  if (search) params.search = search;

  return this.http.get<any>(this.apiUrl, { params });
}

  deleteReviewmarksindex(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  createReviewmarksindex(data: Partial<Reviewmarksindex>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateReviewmarksindex(id: number, body: any) {
    return this.http.put(`${this.apiUrl}/${id}`, body);
  }

  iimportReviewmarksindex(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import`, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  exportAllPDF() { return this.http.get(`${this.apiUrl}/export/pdf`, { responseType: 'blob' }); }
  exportAllExcel() { return this.http.get(`${this.apiUrl}/export/excel`, { responseType: 'blob' }); }
}
