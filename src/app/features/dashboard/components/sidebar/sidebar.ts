import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service'; // استيراد LanguageService
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

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

  menuItems: { key: TranslationKey; icon: string; route: string }[] = [
    { key: 'dashboard', icon: 'fa-brands fa-gg', route: '/dashboard/home' },
    { key: 'subscribers', icon: 'fa-solid fa-users', route: '/dashboard/subscribers' },
    { key: 'complaints', icon: 'fa-solid fa-person-circle-exclamation', route: '/dashboard/profile' },
    { key: 'activityLog', icon: 'fa-solid fa-history', route: '/dashboard/profile' },
    { key: 'plansManagement', icon: 'fa-solid fa-file-contract', route: '/dashboard/profile' },
    { key: 'settings', icon: 'fa-solid fa-cog', route: '/dashboard/profile' }
  ];

  constructor(
    public themeService: ThemeService,
    private languageService: TranslateService
  ) {}

  ngOnInit(): void {
  // اشترك في تغييرات اللغة
  this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
}

loadTranslations(lang: 'en' | 'ar') {
  this.translations = lang === 'en' ? EN : AR;
  document.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // أضف أو احذف كلاس rtl على sidebar
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
    return this.translations[key];
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}
