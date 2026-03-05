import { routes } from './../../../../app.routes';
// ... (الاستيرادات لم تتغير)
import { Component, OnInit } from '@angular/core';
import { Route, Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from '../../../dashboard/components/sidebar/i18n/en';
import { AR } from '../../../dashboard/components/sidebar/i18n/ar';
import { AuthService } from '../../../../core/services/auth';
import { environment } from '../../../../../environment';
type TranslationKey = keyof typeof EN;

// تعريف هيكل لعنصر القائمة الفرعية
interface SubMenuItem {
  key: TranslationKey;
  route: string;
}

// تعريف هيكل لعنصر القائمة الرئيسية
interface MenuItem {
  key: TranslationKey;
  icon: string;
  route?: string; // route اختياري إذا كان العنصر يحتوي على قائمة فرعية
  subMenu?: SubMenuItem[]; // قائمة فرعية اختيارية
}

@Component({
  selector: 'app-secretary-sidebar',
  imports: [RouterModule, CommonModule],
  templateUrl: './secretary-sidebar.html',
  styleUrl: '../../../dashboard/components/sidebar/sidebar.css',
})
export class SecretarySidebar  {
  collapsed = false;
  translations: typeof EN = EN;
  // متغير لتتبع حالة فتح قائمة "Settings"
  isSettingsOpen = false;

  user: any = null;
  logoUrl: string = '';
  fallbackInitials: string = '';
  menuItems: MenuItem[] = [
    { key: 'EngagementContract', icon: 'fa-solid fa-chart-line', route: '/secretary/EngagementContract' },
    // { key: 'reports', icon: 'fa-solid fa-file-contract', route: '/subscriber' },
    { key: 'FinancialStatements', icon: 'fa-regular fa-money-bill-1', route: '/subscriber/subscriber-service' },
{ key: 'profile', icon: 'fa-regular fa-user', route: '/subscriber/profile' },
  ];


  // ... (Constructor و ngOnInit و loadTranslations لم تتغير، تذكر إضافة مفاتيح الترجمة الجديدة في EN و AR)

  constructor(
    public themeService: ThemeService,
    private languageService: TranslateService,
    private auth : AuthService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
        // ✅ اقرأ بيانات المستخدم من localStorage
    this.user = this.auth.getUser();
    this.fallbackInitials = this.getInitials(this.user?.fullName);

    // ✅ جهّز رابط اللوجو (لو موجود)
    // factoryLogo مثال: "uploads\\subscribers\\1772529833163-734591884.jpg"
    // لازم نحول "\" لـ "/"
    const path = (this.user?.factoryLogo || '').replaceAll('\\', '/');

    // لو الـ API بيرجع path نسبي، اربطه بالـ apiUrl
    // عدّل حسب عندك لو السيرفر أصلاً بيرجع URL كامل
    this.logoUrl = path ? `${(environment as any).apiUrl}/${path}` : '';
  }
private getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  }
  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const sidebarEl = document.querySelector('.sidebar') as HTMLElement;
    if (sidebarEl) {
      if (lang === 'ar') {
        sidebarEl.classList.add('rtl');
      } else {
        sidebarEl.classList.remove('rtl');
      }
    }
  }

  t(key: TranslationKey): string {
    // تضمن أن المفتاح موجود قبل محاولة الوصول إليه
    return this.translations[key] || String(key);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  // دالة للتبديل بين حالة الفتح والإغلاق لقائمة Settings المنسدلة
  toggleSettingsDropdown() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }
  logout() {
  this.auth.logout();
  this.router.navigate(['/auth/login']); // optional: redirect بعد logout
}

}
