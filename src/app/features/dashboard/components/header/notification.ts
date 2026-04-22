import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private api_url = environment.apiUrl;
  private http = inject(HttpClient); // إضافة HttpClient

  // جلب الإشعارات الخاصة بالمستخدم
  getMyNotifications(): Observable<any> {
    return this.http.get(`${this.api_url}/notifications/mine`);
  }

  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.api_url}/notifications/mine/unread-count`);
  }

  // تحديد إشعار واحد كمقروء (PATCH)
  markAsRead(id: number): Observable<any> {
    return this.http.patch(`${this.api_url}/notifications/${id}/read`, {});
  }

  // تحديد كل الإشعارات كمقروءة (PATCH)
  markAllAsRead(): Observable<any> {
    return this.http.patch(`${this.api_url}/notifications/mine/mark-all-read`, {});
  }
}