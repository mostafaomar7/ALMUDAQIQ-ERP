import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../../environment';

export interface BranchDetailsResponse {
  id: number;
  name: string;
  cityName: string;
  status: string;
  subscriberId: number;
  managerId: number;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    jobTitle?: string;
    startDate?: string;
    status?: string;
  };
  users?: Array<{
    id: number;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    roleId: number;
  }>;
  subscriber?: {
    id: number;
    cpaWebsite?: string | null;
    commerceWebsite?: string | null;
    taxWebsite?: string | null;
    status?: string;
    country?: { name: string };
  };
}

@Injectable({ providedIn: 'root' })
export class BranchdetailsService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBranchDetails(id: number): Observable<BranchDetailsResponse> {
    return this.http.get<BranchDetailsResponse>(`${this.api_url}/api/branches/${id}`);
  }
}
