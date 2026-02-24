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
  selector: 'app-subscriber-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './subscriber-sidebar.html',
  styleUrl: '../../../dashboard/components/sidebar/sidebar.css',
})
export class SubscriberSidebar {
  collapsed = false;
  translations: typeof EN = EN;
  // متغير لتتبع حالة فتح قائمة "Settings"
  isSettingsOpen = false;

  menuItems: MenuItem[] = [
    { key: 'KPIS', icon: 'fa-brands fa-gg', route: '/subscriber' },
        { key: 'reports', icon: 'fa-brands fa-gg', route: '/subscriber' },
        { key: 'Financial', icon: 'fa-brands fa-gg', route: '/subscriber' },
    { key: 'Branches', icon: 'fa-solid fa-users', route: '/subscriber/branches' },
    { key: 'users', icon: 'fa-solid fa-users', route: '/subscriber/users' },
    { key: 'Support', icon: 'fa-solid fa-users', route: '/subscriber' },

    {
      key: 'settings',
      icon: 'fa-solid fa-cog',
      // لا يوجد route مباشر لعنصر Settings الرئيسي
      subMenu: [ // عناصر القائمة الفرعية
        // { key: 'domainSettings', route: '/dashboard/settings/domain' },
        { key: 'accountsGuide', route: '/subscriber/accountguide' },
        { key: 'reviewGuide', route: '/subscriber/reviewguide' },
        { key: 'fileStagesGuide', route: '/subscriber/filestage' },
        { key: 'reviewObjectivesGuide', route: '/subscriber/reviewobjectivesguide' },
        { key: 'reviewMarksIndex', route: '/subscriber/reviewmarksindex' }
      ]
    },
    { key: 'profile', icon: 'fa-solid fa-users', route: '/subscriber/profile' },

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
