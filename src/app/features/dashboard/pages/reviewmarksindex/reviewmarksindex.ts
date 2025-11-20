import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

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
  styleUrls: ['./reviewmarksindex.css']
})
export class Reviewmarksindex implements OnInit {

  translations: typeof EN = EN;

  allMarks: ReviewMark[] = [];
  displayedMarks: ReviewMark[] = [];
  filteredMarks: ReviewMark[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalItems: number = 0;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];

  isFilterOpen = false;
  filterOptions: FilterOption[] = [];
  filterSearchText = '';

  isExportModalOpen = false;
  selectedExportOption: string = 'pdf2';
  isImportModalOpen = false;

  private sampleData: Omit<ReviewMark,'id'|'selected'>[] = [
    { name: 'Cash Balance Review', code: 'IMG-001', description: 'Check accuracy of cash balance in ledger', suggestedStage: 'Under Review', whenToUse: 'When validating monthly statements', example: 'CBR' },
    { name: 'Vendor Payment Verification', code: 'IMG-002', description: 'Confirm vendor payments match invoice totals', suggestedStage: 'Approved Stage', whenToUse: 'Before closing review file', example: 'VPV' },
    { name: 'AR Aging Analysis', code: 'IMG-003', description: 'Review overdue receivables', suggestedStage: 'Review Stage', whenToUse: 'During AR balance reconciliation', example: 'ARA' },
    { name: 'Inventory Count Accuracy', code: 'IMG-004', description: 'Validate stock quantities', suggestedStage: 'Field Stage', whenToUse: 'At physical stocktaking', example: 'ICA' }
  ];

  constructor(private eRef: ElementRef, private lang: TranslateService) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadTranslations('en'); // default
    this.generateDummyData();
    this.initializeFilterOptions();
    this.applyFilter();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string { return this.translations[key] || key; }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.eRef.nativeElement.contains(event.target) && !event.target.closest('.filter-trigger')) {
      this.isFilterOpen = false;
    }
  }

  generateDummyData() {
    for (let i=1;i<=1250;i++) {
      const s = this.sampleData[(i-1)%this.sampleData.length];
      this.allMarks.push({ ...s, id:i, selected:i===1 });
    }
    this.totalItems = this.allMarks.length;
  }

  initializeFilterOptions() {
    const uniqueStages = [...new Set(this.allMarks.map(m=>m.suggestedStage))];
    this.filterOptions = uniqueStages.map(stage => ({ name: stage, selected: true }));
  }

  toggleFilter(event: Event) { event.stopPropagation(); this.isFilterOpen = !this.isFilterOpen; }
  closeFilter() { this.isFilterOpen = false; }

  applyFilter() {
    const selectedStages = this.filterOptions.filter(f=>f.selected).map(f=>f.name);
    this.filteredMarks = this.allMarks.filter(m=>selectedStages.includes(m.suggestedStage));
    this.totalItems = this.filteredMarks.length;
    this.totalPages = Math.ceil(this.totalItems/this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedData();
    this.calculatePagination();
    this.closeFilter();
  }

  get visibleFilterOptions() {
    return this.filterSearchText ? this.filterOptions.filter(f=>f.name.toLowerCase().includes(this.filterSearchText.toLowerCase())) : this.filterOptions;
  }

  updateDisplayedData() {
    const start = (this.currentPage-1)*this.itemsPerPage;
    this.displayedMarks = this.filteredMarks.slice(start,start+this.itemsPerPage);
  }

  goToPage(page: number|string) { if(typeof page==='number' && page>=1 && page<=this.totalPages){ this.currentPage=page; this.updateDisplayedData(); this.calculatePagination(); } }
  nextPage() { if(this.currentPage<this.totalPages){ this.currentPage++; this.updateDisplayedData(); this.calculatePagination(); } }
  prevPage() { if(this.currentPage>1){ this.currentPage--; this.updateDisplayedData(); this.calculatePagination(); } }
  goToPageInput(e:any){ const p=parseInt(e.target.value); if(!isNaN(p)) this.goToPage(p); }

  calculatePagination() {
    const total=this.totalPages,current=this.currentPage,delta=2,range:number[]=[]; let l:number|undefined,rangeWithDots:(number|string)[]=[];
    if(total>0){ range.push(1); for(let i=current-delta;i<=current+delta;i++){ if(i>1 && i<total) range.push(i); } range.push(total);
      [...new Set(range)].sort((a,b)=>a-b).forEach(i=>{ if(l){ if(i-l===2) rangeWithDots.push(l+1); else if(i-l!==1) rangeWithDots.push('...'); } rangeWithDots.push(i); l=i; });
    } this.pagesArray=rangeWithDots;
  }

  toggleSelection(mark:ReviewMark){ mark.selected=!mark.selected; }
  toggleAll(){ const allSelected=this.displayedMarks.every(m=>m.selected); this.displayedMarks.forEach(m=>m.selected=!allSelected); }

  get showingRangeText(){ const start=(this.currentPage-1)*this.itemsPerPage+1,end=Math.min(this.currentPage*this.itemsPerPage,this.totalItems); return `${start}-${end} ${this.t('page')} ${this.totalItems.toLocaleString()}`; }

  openExportModal(){ this.isExportModalOpen=true; }
  closeExportModal(){ this.isExportModalOpen=false; }
  selectExportOption(opt:string){ this.selectedExportOption=opt; }
  openImportModal(){ this.isImportModalOpen=true; }
  closeImportModal(){ this.isImportModalOpen=false; }
}
