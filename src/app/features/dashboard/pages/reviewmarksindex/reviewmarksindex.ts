import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReviewMark {
  id: number;
  name: string;
  code: string;
  description: string;
  suggestedStage: string;
  whenToUse: string;
  example: string;
  selected: boolean;
}

interface FilterOption {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-reviewmarksindex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewmarksindex.html',
  styleUrls: ['./reviewmarksindex.css'],
})
export class Reviewmarksindex implements OnInit {

  allMarks: ReviewMark[] = [];
  displayedMarks: ReviewMark[] = [];
  filteredMarks: ReviewMark[] = [];

  currentPage: number = 101;
  itemsPerPage: number = 20;
  totalItems: number = 1250;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  // --- Filter Variables ---
  isFilterOpen: boolean = false;
  filterOptions: FilterOption[] = [];
  filterSearchText: string = '';

  // --- Export Modal Variables ---
  isExportModalOpen: boolean = false;
  selectedExportOption: string = 'pdf2';

  // --- Import Modal Variables (NEW) ---
  isImportModalOpen: boolean = false;

  private sampleData = [
    {
      name: 'Cash Balance Review',
      code: 'IMG-001',
      description: 'Check accuracy of cash balance in ledger',
      suggestedStage: 'Under Review',
      whenToUse: 'When validating monthly statements',
      example: 'CBR'
    },
    {
      name: 'Vendor Payment Verification',
      code: 'IMG-002',
      description: 'Confirm vendor payments match invoice totals',
      suggestedStage: 'Approved Stage',
      whenToUse: 'Before closing review file',
      example: 'VPV'
    },
    {
      name: 'AR Aging Analysis',
      code: 'IMG-003',
      description: 'Review overdue receivables',
      suggestedStage: 'Review Stage',
      whenToUse: 'During AR balance reconciliation',
      example: 'ARA'
    },
    {
      name: 'Inventory Count Accuracy',
      code: 'IMG-004',
      description: 'Validate stock quantities',
      suggestedStage: 'Field Stage',
      whenToUse: 'At physical stocktaking',
      example: 'ICA'
    }
  ];

  constructor(private eRef: ElementRef) {}

  ngOnInit() {
    this.generateDummyData();
    this.initializeFilterOptions();
    this.applyFilter();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target) || !event.target.closest('.filter-container')) {
       if(this.isFilterOpen && !event.target.closest('.filter-trigger')) {
         this.isFilterOpen = false;
       }
    }
  }

  generateDummyData() {
    for (let i = 1; i <= this.totalItems; i++) {
      const sample = this.sampleData[(i - 1) % this.sampleData.length];
      const uniqueCode = `IMG-${i.toString().padStart(3, '0')}`;
      this.allMarks.push({
        id: i,
        name: sample.name,
        code: uniqueCode,
        description: sample.description,
        suggestedStage: sample.suggestedStage,
        whenToUse: sample.whenToUse,
        example: sample.example,
        selected: i === 1
      });
    }
  }

  initializeFilterOptions() {
    const uniqueStages = [...new Set(this.allMarks.map(item => item.suggestedStage))];
    this.filterOptions = uniqueStages.map(stage => ({
      name: stage,
      selected: true
    }));
  }

  // --- Export Modal Functions ---
  openExportModal() {
    this.isExportModalOpen = true;
  }

  closeExportModal() {
    this.isExportModalOpen = false;
  }

  selectExportOption(option: string) {
    this.selectedExportOption = option;
  }

  // --- Import Modal Functions (NEW) ---
  openImportModal() {
    this.isImportModalOpen = true;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  // --- Filter Functions ---
  toggleFilter(event: Event) {
    event.stopPropagation();
    this.isFilterOpen = !this.isFilterOpen;
  }

  closeFilter() {
    this.isFilterOpen = false;
  }

  applyFilter() {
    const selectedStages = this.filterOptions
      .filter(opt => opt.selected)
      .map(opt => opt.name);

    this.filteredMarks = this.allMarks.filter(mark =>
      selectedStages.includes(mark.suggestedStage)
    );

    this.totalItems = this.filteredMarks.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;

    this.updateDisplayedData();
    this.calculatePagination();
    this.closeFilter();
  }

  get visibleFilterOptions() {
    if (!this.filterSearchText) return this.filterOptions;
    return this.filterOptions.filter(opt =>
      opt.name.toLowerCase().includes(this.filterSearchText.toLowerCase())
    );
  }

  // --- Pagination Logic ---
  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedMarks = this.filteredMarks.slice(startIndex, endIndex);
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

    if (total > 0) {
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
    }
    this.pagesArray = rangeWithDots;
  }

  toggleSelection(mark: ReviewMark) {
    mark.selected = !mark.selected;
  }

  toggleAll() {
    const allSelected = this.displayedMarks.every(i => i.selected);
    this.displayedMarks.forEach(i => i.selected = !allSelected);
  }

  get showingRangeText(): string {
    if (this.totalItems === 0) return '0 of 0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} of ${this.totalItems.toLocaleString()}`;
  }
}
