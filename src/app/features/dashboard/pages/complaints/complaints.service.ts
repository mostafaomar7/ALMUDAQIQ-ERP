import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

@Injectable({
    providedIn: 'root'
})
export class ComplaintsService {

    private apiUrl = `${environment.apiUrl}/complaints`; // ← غيّرها حسب رابطك

    constructor(private http: HttpClient) {}

    getComplaints(params: any): Observable<any> {
        let httpParams = new HttpParams();

        Object.keys(params).forEach(key => {
            if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.set(key, params[key]);
            }
        });

        return this.http.get<any>(this.apiUrl, { params: httpParams });
    }
    // إضافة دالة للرد باستخدام PATCH
respondComplaint(complaintId: number, body: { response: string }): Observable<any> {
    const url = `${this.apiUrl}/${complaintId}/respond`;
    return this.http.patch(url, body);
}
deleteComplaints(id: number) {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}
