import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected title = 'erp-system';

  // اللغة الحالية (en أو ar)
  currentLang = localStorage.getItem('lang') || 'en';

  constructor(@Inject(DOCUMENT) private document: Document) {
    // ضبط اتجاه الصفحة بناءً على اللغة المحفوظة فور إنشاء الـ component
    this.document.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
  }

  ngOnInit(): void {
    // أي إعدادات إضافية وقت التشغيل تقدر تتحط هنا
  }

  /**
   * نستخدمها لتغيير اللغة:
   * - تخزن في localStorage
   * - تغيّر اتجاه الصفحة (dir)
   * */
  changeLang(lang: 'en' | 'ar') {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
