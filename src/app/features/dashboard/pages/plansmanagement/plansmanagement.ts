import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { TranslateService } from '../../../../core/services/translate.service';

type TranslationKey = keyof typeof EN;

interface Plan {
  id: number;
  name: string;
  description: string;
  duration: string;
  storage: string;
  fees: number;
  number: number;
  selected: boolean;
}

@Component({
  selector: 'app-plansmanagement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plansmanagement.html',
  styleUrls: ['./plansmanagement.css'],
})
export class Plansmanagement {

  translations: typeof EN = EN;
  currentLang: 'en' | 'ar' = 'ar';

  plans: Plan[] = [
    { id: 1, name: 'Starter Plan', description: 'Basic subscription for small teams', duration: '1 Month', storage: '100GB', fees: 5000, number: 10, selected: true },
    { id: 2, name: 'Growth Plan', description: 'Extended plan for medium organizations', duration: '3 Month', storage: '150GB', fees: 15000, number: 50, selected: false },
    { id: 3, name: 'Scale Plan', description: 'Full enterprise plan with unlimited features', duration: '6 Month', storage: '250GB', fees: 35000, number: 100, selected: false }
  ];

  constructor(private languageService: TranslateService) {
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

  toggleAll() {
    const allSelected = this.plans.every(p => p.selected);
    this.plans.forEach(p => p.selected = !allSelected);
  }

  toggleSelection(plan: Plan) {
    plan.selected = !plan.selected;
  }
}
