import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

interface ReviewItem {
  id: number;
  level: string;
  separator: string;
  number: string;
  statement: string;
  purpose: string;
  responsibility: string;
  selected: boolean;
}

@Component({
  selector: 'app-reviewguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewguide.html',
  styleUrls: ['./reviewguide.css'],
})
export class Reviewguide implements OnInit {

  translations: typeof EN = EN;

  constructor(private lang: TranslateService) {}

  // البيانات الكاملة
  allReviews: ReviewItem[] = [];
  displayedReviews: ReviewItem[] = [];

  // إعدادات الترقيم
  currentPage: number = 101;
  itemsPerPage: number = 4;
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  // عينة بيانات لتكرارها
  private sampleData = [
    {
      level: 'Level 1',
      separator: 'A',
      number: '001',
      statement: 'All cash transactions should be verified',
      purpose: 'Ensure accuracy of cash operations',
      responsibility: 'Audit Team'
    },
    {
      level: 'Level 2',
      separator: 'B',
      number: '002',
      statement: 'Vendor invoices must match POs',
      purpose: 'Prevent duplicate payments',
      responsibility: 'Audit Team'
    },
    {
      level: 'Level 3',
      separator: 'C',
      number: '003',
      statement: 'Fixed assets recorded correctly',
      purpose: 'Validate depreciation and cost',
      responsibility: 'Finance'
    },
    {
      level: 'Level 4',
      separator: 'D',
      number: '004',
      statement: 'Check overdue balances & provisions',
      purpose: 'Prevent duplicate payments',
      responsibility: 'Accountant'
    }
  ];

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

  generateDummyData() {
    for (let i = 1; i <= this.totalItems; i++) {
      const sample = this.sampleData[i % this.sampleData.length];
      this.allReviews.push({
        id: i,
        level: sample.level,
        separator: sample.separator,
        number: (parseInt(sample.number) + i).toString().padStart(3, '0'),
        statement: sample.statement,
        purpose: sample.purpose,
        responsibility: sample.responsibility,
        selected: i <= 4
      });
    }
  }

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedReviews = this.allReviews.slice(startIndex, endIndex);
  }

  // Pagination
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

  goToPageInput(event: any) {
    const page = parseInt(event.target.value);
    if (!isNaN(page)) this.goToPage(page);
  }

  calculatePagination() {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) range.push(i);
    }
    range.push(total);

    [...new Set(range)].sort((a, b) => a - b).forEach(i => {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    });

    this.pagesArray = rangeWithDots;
  }

  // Selection
  toggleSelection(item: ReviewItem) {
    item.selected = !item.selected;
  }

  toggleAll() {
    const allSelected = this.displayedReviews.every(i => i.selected);
    this.displayedReviews.forEach(i => i.selected = !allSelected);
  }

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
}
