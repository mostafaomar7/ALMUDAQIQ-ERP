import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

interface Account {
  id: number;
  name: string;
  level: string;
  number: string;
  rules: string;
  notes: string;
  code: string;
  selected: boolean;
}

@Component({
  selector: 'app-accountsguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accountsguide.html',
  styleUrls: ['./accountsguide.css'],
})
export class Accountsguide implements OnInit {

  translations: typeof EN = EN;

  constructor(private lang: TranslateService) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.generateDummyData();
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedData();
    this.calculatePagination();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  // البيانات الكاملة
  allAccounts: Account[] = [];
  displayedAccounts: Account[] = [];

  currentPage: number = 101;
  itemsPerPage: number = 10;
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  // البيانات المترجمة
  private sampleData = [
    { name: this.t('accountsReceivable'), level: this.t('levelWord'), rules: this.t('IAS38'), notes: this.t('costNotBilled'), code: 'A01' },
    { name: this.t('bankAccounts'), level: this.t('levelWord'), rules: this.t('IAS16'), notes: this.t('recognizedMonthly'), code: 'A02' },
    { name: this.t('advancesToSuppliers'), level: this.t('levelWord'), rules: this.t('IFRS16'), notes: this.t('costNotBilled'), code: 'A04' },
    { name: this.t('propertyEquipment'), level: this.t('levelWord'), rules: this.t('IAS16'), notes: this.t('annualProvision'), code: 'A11' },
    { name: this.t('zakatProvision'), level: this.t('levelWord'), rules: this.t('IAS38'), notes: this.t('annualProvision'), code: 'A18' }
  ];

  generateDummyData() {
    for (let i = 1; i <= this.totalItems; i++) {
      const s = this.sampleData[i % this.sampleData.length];
      this.allAccounts.push({
        id: i,
        name: s.name,
        level: `${this.t('levelWord')} ${Math.floor(Math.random() * 15) + 1}`,
        number: (1000 + i).toString(),
        rules: s.rules,
        notes: s.notes,
        code: `A${i}`,
        selected: false
      });
    }
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedAccounts = this.allAccounts.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number | string) {
    if (typeof page === 'string') return;
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  goToPageInput(e: any) {
    const p = parseInt(e.target.value);
    if (!isNaN(p)) this.goToPage(p);
  }

  calculatePagination() {
    const t = this.totalPages;
    const c = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const withDots: (number | string)[] = [];
    let prev: number | undefined;

    range.push(1);
    for (let i = c - delta; i <= c + delta; i++) {
      if (i < t && i > 1) range.push(i);
    }
    range.push(t);

    const unique = [...new Set(range)].sort((a, b) => a - b);

    unique.forEach(i => {
      if (prev) {
        if (i - prev === 2) withDots.push(prev + 1);
        else if (i - prev !== 1) withDots.push('...');
      }
      withDots.push(i);
      prev = i;
    });

    this.pagesArray = withDots;
  }

  toggleSelection(acc: Account) {
    acc.selected = !acc.selected;
  }

  toggleAll() {
    const all = this.displayedAccounts.every(a => a.selected);
    this.displayedAccounts.forEach(a => a.selected = !all);
  }

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
}
