import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriberProfileResponse } from './profile.model';
import { environment } from '../../../../../environment';

export interface ApiPlan {
  id: number;
  name: string;
  description: string;
  durationMonths: number;
  paidFees: number;
  usersLimit: number;
  fileLimit: number;
  maxFileSizeMB: number;
  branchesLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSubscriberProfile(): Observable<SubscriberProfileResponse> {
    return this.http.get<SubscriberProfileResponse>(`${this.api_url}/subscribers/profile`);
  }

  getPlans(): Observable<ApiPlan[]> {
    return this.http.get<ApiPlan[]>(`${this.api_url}/plans`);
  }

  upgradePlan(planId: number): Observable<any> {
    return this.http.post(`${this.api_url}/subscribers/upgrade`, { planId });
  }
}
