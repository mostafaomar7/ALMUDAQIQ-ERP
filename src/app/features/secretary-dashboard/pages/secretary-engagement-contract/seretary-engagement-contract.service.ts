import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ApiContractStatus = 'ACTIVE' | 'INACTIVE';

export interface EngagementContractsResponse {
  data: ApiEngagementContract[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiEngagementContract {
  id: string;
  contractNumber: string;
  customerName: string;
  engagementContractDate: string; // ISO string
  legalEntity: 'Company' | 'Institution' | 'Individual';
  commercialRegisterNumber: string;
  taxNumber: string;
  unifiedNumber: string;
  status: ApiContractStatus;
}

@Injectable({
  providedIn: 'root',
})
export class SeretaryEngagementContractService {
  // لو عندك environment حط baseUrl هناك بدل كده
  private readonly baseUrl = '';

  constructor(private http: HttpClient) {}

  getContracts(opts: { page?: number; limit?: number; search?: string } = {}): Observable<EngagementContractsResponse> {
    let params = new HttpParams();

    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.search) params = params.set('search', opts.search.trim());

    // لو الـ endpoint عندك كامل (مثلاً /api/engagement-contracts) عدّل هنا
    return this.http.get<EngagementContractsResponse>(`${this.baseUrl}/engagement-contracts`, { params });
  }
}
