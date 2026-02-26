import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../../environment';

export interface UserDetailsResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  mustChangePassword: boolean;
  roleId: number;
  subscriberId: number;
  branchId: number;
  jobTitle?: string | null;
  startDate?: string | null;
  language?: string | null;
  timeZone?: string | null;
  workLocation?: string | null;
  profilePhoto?: string | null;
  emailSignature?: string | null;
  emergencyContact?: any;
  assignedDevices?: any;
  recoveryEmail?: string | null;
  recoveryPhone?: string | null;
  suggestedUsername?: string | null;
  permissions?: any;
  createdAt: string;
  updatedAt: string;

  Role?: { id: number; name: string };
  branch?: { id: number; name: string; cityName: string; status: string };
}

@Injectable({ providedIn: 'root' })
export class UserDetailsService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserDetails(id: number): Observable<UserDetailsResponse> {
    return this.http.get<UserDetailsResponse>(`${this.api_url}/users/${id}`);
  }
}
