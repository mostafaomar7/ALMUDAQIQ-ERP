import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; // 👈 هام جداً
import { NotificationService } from './notification';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule // 👈 إضافة الموديول هنا
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  // 👈 هذا السطر مهم لتطبيق ستايل القائمة المنسدلة المخصص
  encapsulation: ViewEncapsulation.None
})
export class Header {
  currentLang: 'en' | 'ar';
  userName: string = 'khalil mohamed';
  userEmail: string = 'khalidmohamed2@gmail.com';
  userAvatar: string = 'assets/user.png';

  activeTab: string = 'All'; // للتحكم في التاب النشط

  // بيانات الإشعارات مطابقة للصورة
 notifications: any[] = []; // 👈 هنخزن الداتا اللي جاية من الـ API هنا
  unreadCount: number = 0;
private notificationService = inject(NotificationService);
  constructor(
    public translateService: TranslateService,
    public themeService: ThemeService
  ) {
    this.currentLang = this.translateService.currentLang;
  }
ngOnInit() {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (res) => {
        this.notifications = res.data;
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.count;
      },
      error: (err) => console.error('Error fetching count', err)
    });
  }

  // 👈 دالة للـ PATCH بتاع إشعار واحد
  markAsRead(item: any, event: Event) {
    event.stopPropagation(); // عشان القائمة متقفلش
    if (item.isRead) return; // لو مقروءة أصلاً متعملش حاجة

    this.notificationService.markAsRead(item.id).subscribe({
      next: () => {
        item.isRead = true;
        if (this.unreadCount > 0) this.unreadCount--; // تقليل العدد الظاهر فوق الأيقونة
      },
      error: (err) => console.error('Error marking as read', err)
    });
  }

  // 👈 دالة للـ PATCH بتاع كل الإشعارات (ممكن تربطها بزرار "Mark all as read" لو حابب)
  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      },
      error: (err) => console.error('Error marking all as read', err)
    });
  }

  // 👈 دالة لفلترة الإشعارات بناءً على التاب
  get filteredNotifications() {
    if (this.activeTab === 'Unread') {
      return this.notifications.filter(n => !n.isRead);
    }
    if (this.activeTab === 'System') {
      return this.notifications.filter(n => n.type === 'SYSTEM_ERROR');
    }
    return this.notifications;
  }

  // 👈 دالة مساعدة لتحديد الأيقونة واللون بناءً على نوع الـ API
  getNotificationIcon(type: string) {
    switch(type) {
      case 'SYSTEM_ERROR': return { icon: 'fa-circle-exclamation', class: 'danger' };
      case 'WORKFLOW': return { icon: 'fa-ticket', class: 'info' };
      default: return { icon: 'fa-bell', class: 'default' };
    }
  }
  
  toggleLang() {
    const newLang = this.currentLang === 'en' ? 'ar' : 'en';
    this.translateService.changeLang(newLang);
    this.currentLang = newLang;
  }

  toggleTheme() {
  this.themeService.toggleTheme();
}

  // دالة تغيير التاب (شكلياً فقط حالياً)
  selectTab(tab: string, event: Event) {
    event.stopPropagation(); // لمنع إغلاق القائمة عند الضغط على التاب
    this.activeTab = tab;
  }
}
