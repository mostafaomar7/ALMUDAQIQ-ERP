import { environment } from './../../../../../environment';
// contract.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Contract } from './contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private http = inject(HttpClient);

  // ضع الرابط الأساسي للـ API الخاص بك هنا
  private apiUrl = environment.apiUrl;

  getContracts(page: number = 1, limit: number = 10, search: string = ''): Observable<ApiResponse<Contract>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search); // أو 'keyword' حسب ما يقبله الباك إند عندك
    }

    return this.http.get<ApiResponse<Contract>>(`${this.apiUrl}/engagement-contracts`, { params });
  }
}
