import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AR } from './i18n/ar';
import { EN } from './i18n/en';
import { TranslateService } from '../../../../core/services/translate.service';

type TranslationKey = keyof typeof EN;

interface ActivityItem {
  id: number;
  user: string;
  role: 'subscriber' | 'admin';
  action: 'deleteFile' | 'updateProfile' | 'viewReport' | 'loginSuccess' | 'newComplaint';
  timeAgo: '5daysAgo' | '6daysAgo';
  imageUrl: string;
}

interface ActivityGroup {
  dateHeader: 'today' | 'apr24';
  items: ActivityItem[];
}

@Component({
  selector: 'app-activitylog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activitylog.html',
  styleUrl: './activitylog.css',
})
export class Activitylog implements OnInit {

  translations: typeof EN = EN;
  currentLang: 'en' | 'ar' = 'ar';

  activityTimeline: ActivityGroup[] = [
    {
      dateHeader: 'today',
      items: [
        { id: 1, user: 'Youssef Hassan', role: 'subscriber', action: 'deleteFile', timeAgo: '5daysAgo', imageUrl: 'https://placehold.co/40x40/555/FFF?text=YH' },
        { id: 2, user: 'Youssef Hassan', role: 'subscriber', action: 'updateProfile', timeAgo: '5daysAgo', imageUrl: 'https://placehold.co/40x40/555/FFF?text=YH' },
      ]
    },
    {
      dateHeader: 'apr24',
      items: [
        { id: 5, user: 'Ahmed Ali', role: 'admin', action: 'loginSuccess', timeAgo: '6daysAgo', imageUrl: 'https://placehold.co/40x40/333/FFF?text=AA' },
      ]
    }
  ];

  constructor(private languageService: TranslateService) {}

  ngOnInit(): void {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.currentLang = lang;
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

}
