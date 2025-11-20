import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

interface ObjectiveGuide {
  id: number;
  code: string;
  collectedCount: number;
  ethicalCompliance: number;
  professionalPlanning: number;
  performanceEffectiveness: number;
  internalAssessment: number;
  selected: boolean;
}

@Component({
  selector: 'app-reviewobjectivesguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewobjectivesguide.html',
  styleUrls: ['./reviewobjectivesguide.css'],
})
export class Reviewobjectivesguide implements OnInit {

  translations: typeof EN = EN;

  constructor(private lang: TranslateService) {}

  allGuides: ObjectiveGuide[] = [];
  displayedGuides: ObjectiveGuide[] = [];

  currentPage: number = 101;
  itemsPerPage: number = 12;
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

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
      this.allGuides.push({
        id: i,
        code: 'STG-001',
        collectedCount: 6,
        ethicalCompliance: 20,
        professionalPlanning: 30,
        performanceEffectiveness: 10,
        internalAssessment: 10,
        selected: i <= 2
      });
    }
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedGuides = this.allGuides.slice(start, start + this.itemsPerPage);
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
    const withDots: (number | string)[] = [];
    let l: number | undefined;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) range.push(i);
    }
    range.push(total);

    [...new Set(range)].sort((a, b) => a - b).forEach(i => {
      if (l) {
        if (i - l === 2) withDots.push(l + 1);
        else if (i - l !== 1) withDots.push('...');
      }
      withDots.push(i);
      l = i;
    });

    this.pagesArray = withDots;
  }

  // Selection
  toggleSelection(item: ObjectiveGuide) {
    item.selected = !item.selected;
  }

  toggleAll() {
    const allSelected = this.displayedGuides.every(i => i.selected);
    this.displayedGuides.forEach(i => i.selected = !allSelected);
  }

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
}
