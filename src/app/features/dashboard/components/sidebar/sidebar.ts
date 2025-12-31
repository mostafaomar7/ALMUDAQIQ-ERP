import { routes } from './../../../../app.routes';
// ... (الاستيرادات لم تتغير)
import { Component, OnInit } from '@angular/core';
import { Route, Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { AuthService } from '../../../../core/services/auth';
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
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  collapsed = false;
  translations: typeof EN = EN;
  // متغير لتتبع حالة فتح قائمة "Settings"
  isSettingsOpen = false;

  menuItems: MenuItem[] = [
    { key: 'dashboard', icon: 'fa-brands fa-gg', route: '/dashboard/home' },
    { key: 'subscribers', icon: 'fa-solid fa-users', route: '/dashboard/subscribers' },
    { key: 'complaints', icon: 'fa-solid fa-person-circle-exclamation', route: '/dashboard/complaints' },
    { key: 'activityLog', icon: 'fa-solid fa-history', route: '/dashboard/activity' },
    { key: 'plansManagement', icon: 'fa-solid fa-file-contract', route: '/dashboard/plansmanagements' },
    {
      key: 'settings',
      icon: 'fa-solid fa-cog',
      // لا يوجد route مباشر لعنصر Settings الرئيسي
      subMenu: [ // عناصر القائمة الفرعية
        { key: 'domainSettings', route: '/dashboard/settings/domain' },
        { key: 'accountsGuide', route: '/dashboard/settings/accounts-guide' },
        { key: 'reviewGuide', route: '/dashboard/settings/review-guide' },
        { key: 'fileStagesGuide', route: '/dashboard/settings/file-stages-guide' },
        { key: 'reviewObjectivesGuide', route: '/dashboard/settings/review-objectives-guide' },
        { key: 'reviewMarksIndex', route: '/dashboard/settings/review-marks-index' }
      ]
    }
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
