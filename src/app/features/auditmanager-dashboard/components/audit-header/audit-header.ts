import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu'; // 👈 هام جداً

@Component({
  selector: 'app-audit-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule // 👈 إضافة الموديول هنا
  ],

templateUrl: './audit-header.html',
 styleUrl: './../../../dashboard/components/header/header.css',
   encapsulation: ViewEncapsulation.None
})


export class AuditHeader  {
  currentLang: 'en' | 'ar';
  userName: string = 'khalil mohamed';
  userEmail: string = 'khalidmohamed2@gmail.com';
  userAvatar: string = 'assets/user.png';

  activeTab: string = 'All'; // للتحكم في التاب النشط

  // بيانات الإشعارات مطابقة للصورة
  notifications = [
    {
      title: 'New Subscriber Added',
      desc: 'Ahmed Ali registered in Riyadh',
      time: '11 hours ago',
      icon: 'fa-user-plus',
      type: 'info', // للتحكم في الألوان
      read: false
    },
    {
      title: 'Subscription Expired',
      desc: 'Khalid Corp plan expired yesterday',
      time: '12 hours ago',
      icon: 'fa-triangle-exclamation',
      type: 'warning',
      read: true
    },
    {
      title: 'New Complaint Submitted',
      desc: 'Mohamed Salah reported a technical issue',
      time: 'Aug 25, 2025 - 14:35',
      icon: 'fa-user-clock',
      type: 'default',
      read: true
    },
    {
      title: 'Support Ticket Updated',
      desc: 'Ticket #4523 status changed to "In Progress"',
      time: 'Aug 15, 2025 - 16:25',
      icon: 'fa-ticket',
      type: 'success',
      read: true
    },
    {
      title: 'System Error Detected',
      desc: 'Payment gateway connection failed',
      time: 'Aug 11, 2025 - 10:55',
      icon: 'fa-circle-exclamation',
      type: 'danger',
      read: true
    }
  ];

  constructor(
    public translateService: TranslateService,
    public themeService: ThemeService
  ) {
    this.currentLang = this.translateService.currentLang;
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
