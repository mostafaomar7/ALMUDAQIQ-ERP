// complaints.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

interface Complaint {
    id: number;
    name: string;
    email: string;
    mobile: string;
    type: string;
    message: string;
    date: string;
    license: string;
}

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css',
})
export class Complaints implements OnInit {

  translations: typeof EN = EN;

  showComplaintModal: boolean = false;
  selectedComplaint: Complaint | null = null;

  Math = Math;

  complaintsData: Complaint[] = [
    { id: 1, name: 'Ahmed Ali', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', type: 'Technical', message: 'The system stopped working...', date: '15 Aug 2025', license: '12/05/2023' },
    { id: 2, name: 'Youssef Hassan', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', type: 'Technical', message: 'Slow connection speeds...', date: '16 Aug 2025', license: '12/05/2023' },
    { id: 3, name: 'Omar Khaled', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', type: 'Technical', message: 'Internet issue...', date: '17 Aug 2025', license: '12/05/2023' },
    { id: 4, name: 'Mona Ibrahim', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', type: 'Technical', message: 'Internet issue...', date: '18 Aug 2025', license: '12/05/2023' },
  ];

  currentPage: number = 101;
  itemsPerPage: number = 10;
  totalItems: number = 1250;
  goToPageInput: number | null = 101;

  constructor(private languageService: TranslateService) {}

  ngOnInit(): void {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  openComplaintDetails(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.showComplaintModal = true;
  }

  closeComplaintDetails() {
    this.showComplaintModal = false;
    this.selectedComplaint = null;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const finalPages: (number | string)[] = [];
    let prev: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (prev) {
        if (i - prev === 2) finalPages.push(prev + 1);
        else if (i - prev !== 1) finalPages.push('...');
      }
      finalPages.push(i);
      prev = i;
    });

    return finalPages;
  }

  changePage(page: number | string) {
    if (typeof page === 'string') return;
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPage() {
    if (this.goToPageInput) {
      this.changePage(this.goToPageInput);
      this.goToPageInput = null;
    }
  }
}
