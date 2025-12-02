import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AR } from './i18n/ar';
import { EN } from './i18n/en';
import { TranslateService } from '../../../../core/services/translate.service';
import { ActivitylogService } from './activitylog.service';

type TranslationKey = string;

interface ActivityItem {
  id: number;
  user: string;
  email: string;
  role: string;
  action: string;
  message: string;
  timeAgo: string;
  imageUrl: string;
}

interface ActivityGroup {
  dateHeader: string; // today | 24 Apr
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

  activityTimeline: ActivityGroup[] = [];

  constructor(
    private languageService: TranslateService,
    private activityService: ActivitylogService
  ) {}

  ngOnInit(): void {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
    this.loadActivityData();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.currentLang = lang;
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
t(key: string): string {
  return (this.translations as any)[key] || key;
}

  // ------------------------------
  // LOAD API DATA
  // ------------------------------

  loadActivityData() {
    this.activityService.getActivityLogs().subscribe((res: any) => {
      const logs = res.data;
      this.activityTimeline = this.processLogs(logs);
    });
  }

  // ------------------------------
  // FORMAT DATE
  // ------------------------------

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return 'today';

    const day = date.getDate();
    const month = date.toLocaleString('en', { month: 'short' }); // Apr, Dec

    return `${day} ${month}`; // e.g. 24 Apr
  }

  // ------------------------------
  // TIME AGO
  // ------------------------------
getTimeAgo(dateStr: string): string {
  const created = new Date(dateStr);
  const today = new Date();

  // نعمل reset للوقت لتصبح المقارنة يوم فقط (بدون ساعات)
  const createdDateOnly = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffMs = todayDateOnly.getTime() - createdDateOnly.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}daysAgo`;
}

  // ------------------------------
  // PROCESS API RESPONSE
  // ------------------------------

  processLogs(logs: any[]): ActivityGroup[] {
    const groups: { [key: string]: ActivityItem[] } = {};

    logs.forEach((log) => {
      const dateHeader = this.formatDate(log.createdAt);

      if (!groups[dateHeader]) groups[dateHeader] = [];

      groups[dateHeader].push({
        id: log.id,
        user: log.user.fullName,
        email: log.user.email,
        role: log.userType?.toLowerCase() || 'admin',
        action: log.action.toLowerCase(),
        message: log.message,
        timeAgo: this.getTimeAgo(log.createdAt),
        imageUrl: 'https://placehold.co/40x40/555/FFF?text=' + log.user.fullName.charAt(0)
      });
    });

    return Object.keys(groups).map(date => ({
      dateHeader: date,
      items: groups[date]
    }));
  }

}
