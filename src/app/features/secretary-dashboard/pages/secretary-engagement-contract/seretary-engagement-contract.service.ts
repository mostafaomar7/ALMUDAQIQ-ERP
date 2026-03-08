import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

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
  commercialRegisterDate?: string;
  taxNumber: string;
  unifiedNumber: string;
  nationality?: string;
  postalCode?: string;
  address?: string;
  email?: string;
  region?: string;
  status: ApiContractStatus;
  // أضف أي حقول أخرى تأتي من الـ API وتحتاجها في التعديل
}

@Injectable({
  providedIn: 'root',
})
export class SeretaryEngagementContractService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getContracts(opts: { page?: number; limit?: number; search?: string } = {}): Observable<EngagementContractsResponse> {
    let params = new HttpParams();

    if (opts.page != null) params = params.set('page', String(opts.page));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    if (opts.search) params = params.set('search', opts.search.trim());

    return this.http.get<EngagementContractsResponse>(`${this.baseUrl}/engagement-contracts`, { params });
  }

  createContract(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/engagement-contracts`, formData);
  }

  // --- New: Update Method ---
  updateContract(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/engagement-contracts/${id}`, formData);
  }
  getContractById(id: string): Observable<any> { // يفضل استبدال any بـ Interface دقيق
    return this.http.get<any>(`${this.baseUrl}/engagement-contracts/${id}`);
  }
}
