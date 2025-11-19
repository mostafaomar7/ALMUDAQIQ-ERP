import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // البيانات الكاملة والمعروضة
  allGuides: ObjectiveGuide[] = [];
  displayedGuides: ObjectiveGuide[] = [];

  // إعدادات الترقيم
  currentPage: number = 101;
  itemsPerPage: number = 12; // عدد العناصر في الصفحة الواحدة حسب الصورة
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  ngOnInit() {
    this.generateDummyData();
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedData();
    this.calculatePagination();
  }

  generateDummyData() {
    for (let i = 1; i <= this.totalItems; i++) {
      this.allGuides.push({
        id: i,
        code: 'STG-001', // تكرار الكود كما في الصورة
        collectedCount: 6,
        ethicalCompliance: 20,
        professionalPlanning: 30,
        performanceEffectiveness: 10,
        internalAssessment: 10,
        selected: i <= 2 // تحديد أول عنصرين فقط كما في الصورة
      });
    }
  }

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedGuides = this.allGuides.slice(startIndex, endIndex);
  }

  // --- Pagination Logic ---
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

  // --- Selection Logic ---
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
    return `${start}-${end} of ${this.totalItems.toLocaleString()}`;
  }
}
