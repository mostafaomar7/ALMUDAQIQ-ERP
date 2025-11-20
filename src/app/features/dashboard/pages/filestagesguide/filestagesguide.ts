import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

interface FileStage {
  id: number;
  code: string;
  name: string;
  description: string;
  order: number;
  role: string;
  duration: number;
  selected: boolean;
}

@Component({
  selector: 'app-filestagesguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filestagesguide.html',
  styleUrls: ['./filestagesguide.css'],
})
export class Filestagesguide implements OnInit {

  translations: typeof EN = EN;

  constructor(private lang: TranslateService) {}

  allStages: FileStage[] = [];
  displayedStages: FileStage[] = [];

  currentPage: number = 101;
  itemsPerPage: number = 4;
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  private sampleData = [
    { code: 'STG-001', name: 'Draft', description: 'Initial version created by user', order: 1, role: 'User', duration: 5 },
    { code: 'STG-002', name: 'Under Review', description: 'File currently under reviewer assessment', order: 2, role: 'Reviewer', duration: 10 },
    { code: 'STG-003', name: 'Reviewed', description: 'Review completed, awaiting approval', order: 3, role: 'Reviewer', duration: 3 },
    { code: 'STG-004', name: 'Approved', description: 'File approved by authorized person', order: 4, role: 'Approver', duration: 7 }
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
      const sample = this.sampleData[(i - 1) % this.sampleData.length];
      const uniqueCode = `STG-${i.toString().padStart(3, '0')}`;
      this.allStages.push({
        id: i,
        code: uniqueCode,
        name: sample.name,
        description: sample.description,
        order: sample.order,
        role: sample.role,
        duration: sample.duration,
        selected: i === 1
      });
    }
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedStages = this.allStages.slice(start, start + this.itemsPerPage);
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
  toggleSelection(stage: FileStage) {
    stage.selected = !stage.selected;
  }

  toggleAll() {
    const allSelected = this.displayedStages.every(s => s.selected);
    this.displayedStages.forEach(s => s.selected = !allSelected);
  }

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
}
