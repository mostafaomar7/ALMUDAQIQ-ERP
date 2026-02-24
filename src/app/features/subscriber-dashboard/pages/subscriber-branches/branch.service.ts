import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

export interface AddBranchPayload {
  name: string;
  cityName: string;          // ✅ بدل cityId
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  startDate: string;         // YYYY-MM-DD
}

export interface BranchApiItem {
  id: number;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  city: string;
  manager: null | {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    jobTitle: string;
    startDate: string;
  };
  externalLinks?: any;
  createdAt: string;
}

export interface BranchDetailsResponse {
  data: BranchApiItem;
}

export interface UpdateBranchPayload {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';

  cityName?: string;         // ✅ بدل cityId

  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
  startDate?: string;        // YYYY-MM-DD
}

export interface BranchesResponse {
  data: BranchApiItem[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBranches(page: number, limit: number): Observable<BranchesResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http.get<BranchesResponse>(`${this.baseUrl}/api/branches`, { params });
  }

  addBranch(payload: AddBranchPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/branches`, payload);
  }

  updateBranchStatus(
    id: number,
    body: { name: string; status: 'ACTIVE' | 'INACTIVE' }
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/branches/${id}`, body);
  }

  getBranchById(id: number): Observable<BranchDetailsResponse> {
    return this.http.get<BranchDetailsResponse>(`${this.baseUrl}/api/branches/${id}`);
  }

  updateBranch(id: number, payload: UpdateBranchPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/branches/${id}`, payload);
  }
}
