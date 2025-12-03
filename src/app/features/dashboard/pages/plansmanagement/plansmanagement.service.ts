import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environment';
import { Observable } from 'rxjs';

export interface Plan {
  id?: number;
  name: string;
  description: string;
  durationMonths: number;
  paidFees: number;
  usersLimit: number;
  clientsLimit: number;
  branchesLimit: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlansmanagementService {
  private api_url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.api_url}/plans`);
  }

  addPlan(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.api_url}/plans`, plan);
  }

  updatePlan(id: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.api_url}/plans/${id}`, plan);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api_url}/plans/${id}`);
  }
}
