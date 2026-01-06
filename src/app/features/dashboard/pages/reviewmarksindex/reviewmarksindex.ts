import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { ReviewmarksindexService, Reviewmarksindex } from './reviewmarksindex.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-reviewmarksindex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewmarksindex.html',
  styleUrls: ['./reviewmarksindex.css']
})
export class ReviewmarksindexComponent implements OnInit {

  translations: typeof EN = EN;

  allMarks: Reviewmarksindex[] = [];
  displayedMarks: Reviewmarksindex[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalItems: number = 0;
  totalPages: number = 0;
  pagesArray: (number|string)[] = [];

  // Filter
  isFilterOpen = false;
  filterOptions: string[] = [];
  selectedFilterOptions: string[] = [];

  // Export / Import
  isExportModalOpen = false;
  selectedExportOption: 'pdf' | 'excel' | null = null;
  isImportModalOpen = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  // Add/Edit Modal
  isModalOpen = false;
  isEditMode = false;
  newMark: Partial<Reviewmarksindex> = {};
  selectedMark: Reviewmarksindex | null = null;

  // Search
  searchText: string = '';

  constructor(private svc: ReviewmarksindexService, private lang: TranslateService, private eRef: ElementRef) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadMarks();
  }

  loadTranslations(lang: 'en'|'ar') { this.translations = lang==='en'?EN:AR; }
  t(key: TranslationKey): string { return this.translations[key] || key; }

  // ---- API ----
  loadMarks() {
    this.svc.getReviewmarksindex().subscribe({
      next: res => {
        this.allMarks = res.map(r => ({ ...r, selected: false }));
        this.totalItems = this.allMarks.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
        this.updateDisplayedData();
        this.initFilterOptions();
        this.calculatePagination();
      },
      error: err => { console.error(err); Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error'); }
    });
  }

  initFilterOptions() {
    const stages = Array.from(new Set(this.allMarks.map(m => m.suggestedStage)));
    this.filterOptions = stages;
    this.selectedFilterOptions = [...stages];
  }

  toggleFilter(event: Event) { event.stopPropagation(); this.isFilterOpen = !this.isFilterOpen; }
  closeFilter() { this.isFilterOpen = false; }
  applyFilter() {
    this.displayedMarks = this.allMarks.filter(m => this.selectedFilterOptions.includes(m.suggestedStage));
    this.totalItems = this.displayedMarks.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedData();
    this.calculatePagination();
    this.closeFilter();
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) { if(!this.eRef.nativeElement.contains(event.target)) this.closeFilter(); }

  // ---- Pagination ----
  updateDisplayedData() {
    const start = (this.currentPage-1)*this.itemsPerPage;
    this.displayedMarks = this.allMarks.slice(start, start+this.itemsPerPage);
  }

  goToPage(page:number|string) { if(typeof page==='number' && page>=1 && page<=this.totalPages){ this.currentPage=page; this.updateDisplayedData(); this.calculatePagination(); } }
  nextPage() { if(this.currentPage<this.totalPages){ this.currentPage++; this.updateDisplayedData(); this.calculatePagination(); } }
  prevPage() { if(this.currentPage>1){ this.currentPage--; this.updateDisplayedData(); this.calculatePagination(); } }
  goToPageInput(e:any){ const p=parseInt(e.target.value); if(!isNaN(p)) this.goToPage(p); }

  calculatePagination() {
    const total=this.totalPages,current=this.currentPage,delta=2,range:number[]=[]; let l:number|undefined,rangeWithDots:(number|string)[]=[];
    if(total>0){ range.push(1); for(let i=current-delta;i<=current+delta;i++){ if(i>1 && i<total) range.push(i); } range.push(total);
      [...new Set(range)].sort((a,b)=>a-b).forEach(i=>{ if(l){ if(i-l===2) rangeWithDots.push(l+1); else if(i-l!==1) rangeWithDots.push('...'); } rangeWithDots.push(i); l=i; });
    } this.pagesArray=rangeWithDots;
  }

  // ---- Selection ----
toggleSelection(mark: Reviewmarksindex) {
  mark.selected = !mark.selected;

  if (mark.selected) {
    this.selectedMark = mark;
    this.displayedMarks.forEach(m => {
      if (m !== mark) m.selected = false;
    });
  } else {
    this.selectedMark = null;
  }
}
  toggleAll() {
    const allSelected = this.displayedMarks.every(m => m.selected);
    this.displayedMarks.forEach(m => m.selected = !allSelected);
  }

  selectMark(mark: Reviewmarksindex) {
    this.selectedMark = mark;
    this.displayedMarks.forEach(m => m.selected = m === mark);
  }

  get showingRangeText() {
    const start = (this.currentPage-1)*this.itemsPerPage+1;
    const end = Math.min(this.currentPage*this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('page')} ${this.totalItems.toLocaleString()}`;
  }

  // ---- Search ----
applySearch() {
  this.selectedMark = null;

  const text = this.searchText.trim().toLowerCase();

  // فلترة allMarks مباشرة بدون إعادة slice
  this.displayedMarks = this.allMarks.filter(m =>
    m.name?.toLowerCase().includes(text) ||
    m.shortDescription?.toLowerCase().includes(text) ||
    m.codeImage?.toLowerCase().includes(text)
  );

  this.totalItems = this.displayedMarks.length;
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.currentPage = 1;

  // قم بتقطيع displayedMarks حسب الصفحة بعد البحث
  const start = (this.currentPage - 1) * this.itemsPerPage;
  this.displayedMarks = this.displayedMarks.slice(start, start + this.itemsPerPage);

  this.calculatePagination();
}

  // ---- Import / Export ----
  openImportModal(){ this.isImportModalOpen=true; }
  closeImportModal(){ this.isImportModalOpen=false; this.selectedFile=null; this.uploadProgress=0; }
  onFileSelected(e:any){ if(e.target.files?.length) this.selectedFile = e.target.files[0]; }

  uploadFile(){
    if(!this.selectedFile) return;
    this.isUploading=true; this.uploadProgress=0;
    this.svc.iimportReviewmarksindex(this.selectedFile).subscribe({
      next: e=>{
        if(e.type===HttpEventType.UploadProgress && e.total) this.uploadProgress=Math.round((100*e.loaded)/e.total);
        else if(e.type===HttpEventType.Response){
          this.isUploading=false;
          Swal.fire(this.t('success'), this.t('success'),'success');
          this.closeImportModal();
          this.loadMarks();
        }
      },
error: err => {
  this.isUploading = false;
  console.error('Import err', err);

  // منطق ذكي لاستخراج الرسالة:
  // نبحث في err.error.error أولاً لأن الباك اند يضع فيها التفاصيل
  // ثم err.error.message
  // ثم err.error نفسها (لو كانت String)

  let displayMessage = this.t('somethingWentWrong');

  if (err.error) {
    if (typeof err.error.error === 'string') {
      displayMessage = err.error.error; // ستجلب "Only Excel (.xlsx) files are allowed"
    } else if (typeof err.error.message === 'string' && err.error.message !== 'Internal Server Error') {
      displayMessage = err.error.message;
    } else if (typeof err.error === 'string') {
      displayMessage = err.error;
    }
  }

  Swal.fire({
    title: this.t('error'),
    text: displayMessage,
    icon: 'error',
    // هذا يضمن أن SweetAlert سيبحث عن الحاوية الصحيحة
    target: document.querySelector('.objectives-container') as HTMLElement || 'body'
  });
}    });
  }

  openExportModal(){ this.isExportModalOpen=true; }
  closeExportModal(){ this.isExportModalOpen=false; this.selectedExportOption=null; }
  selectExportOption(opt: 'pdf'|'excel'){ this.selectedExportOption=opt; }

  downloadFile(blob:Blob, filename:string){
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); window.URL.revokeObjectURL(url);
  }

  handleExport(){
    if(!this.selectedExportOption){ Swal.fire(this.t('warning'), this.t('chooseFileType'),'info'); return; }
    const selected = this.allMarks.filter(m => m.selected);
    if(selected.length===1 && selected[0].id){
      const id = selected[0].id;
      if(this.selectedExportOption==='pdf') this.svc.exportAllPDF().subscribe(b=>this.downloadFile(b,`reviewmarks_${id}.pdf`));
      else this.svc.exportAllExcel().subscribe(b=>this.downloadFile(b,`reviewmarks_${id}.xlsx`));
      this.closeExportModal(); return;
    }
    if(this.selectedExportOption==='pdf') this.svc.exportAllPDF().subscribe(b=>this.downloadFile(b,'reviewmarks.pdf'));
    if(this.selectedExportOption==='excel') this.svc.exportAllExcel().subscribe(b=>this.downloadFile(b,'reviewmarks.xlsx'));
    this.closeExportModal();
  }

  // ---- Modal Add/Edit ----
  openAddEditModal(mark: Reviewmarksindex | null) {
  if (!mark) {
    this.isEditMode = false;
    this.newMark = {
  codeImage: '',
  name: '',
  shortDescription: '',
  suggestedStage: '',
  whenToUse: '',
  exampleShortForm: '',
  sectorTags: '',
  assertion: '',
  benchmark: '',
  scoreWeight: 0,      // <- تأكد أنها number
  severityLevel: 0,    // <- تأكد أنها number
  severityWeight: 0,   // <- تأكد أنها number
  priorityRating: ''
};
  } else {
    this.isEditMode = true;
    this.newMark = JSON.parse(JSON.stringify(mark));
  }
  this.currentStep = 1;
  this.isModalOpen = true;
}

  closeModal() {
    this.isModalOpen = false;
    this.newMark = {};
  }
submitMark() {
    if (!this.validateStep()) return;

  // نجعل نسخة من newMark لتعديلها قبل الإرسال
  const body: Partial<Reviewmarksindex> = {};

  // قائمة الحقول التي نرسلها للباك فقط
  const fieldsToSend: (keyof Reviewmarksindex)[] = [
    'codeImage',
    'name',
    'shortDescription',
    'suggestedStage',
    'whenToUse',
    'exampleShortForm',
    'sectorTags',
    'assertion',
    'benchmark',
    'scoreWeight',
    'severityLevel',
    'severityWeight',
    'priorityRating'
  ];

  fieldsToSend.forEach(key => {
    let value = this.newMark[key];

    // تحويل الحقول الرقمية إلى number صريح
    if (['scoreWeight', 'severityLevel', 'severityWeight'].includes(key)) {
      value = Number(value);
    }

    // تجاهل undefined، null أو نص فارغ
    if (value !== undefined && value !== null) {
      if (typeof value === 'string' && value.trim() === '') return;
      body[key] = value as any;
    }
  });

  // إرسال البيانات للباك
  if (this.isEditMode && this.newMark.id) {
    this.svc.updateReviewmarksindex(this.newMark.id, body).subscribe({
      next: () => {
        Swal.fire(this.t('success'), this.t('success'),'success');
        this.closeModal();
        this.loadMarks();
      },
      error: () => Swal.fire(this.t('error'), this.t('somethingWentWrong'),'error')
    });
  } else {
    this.svc.createReviewmarksindex(body).subscribe({
      next: () => {
        Swal.fire(this.t('success'), this.t('success'),'success');
        this.closeModal();
        this.loadMarks();
      },
      error: () => Swal.fire(this.t('error'), this.t('somethingWentWrong'),'error')
    });
  }
}

  // ---- Delete ----
  deleteMark(mark: Reviewmarksindex) {
    if(!mark.id) return;
    Swal.fire({
      title: this.t('confirmDelete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.t('yesDelete'),
      cancelButtonText: this.t('cancel')
    }).then(result => {
      if(result.isConfirmed) {
        this.svc.deleteReviewmarksindex(mark.id!).subscribe({
          next: () => { Swal.fire(this.t('success'), this.t('deleted'),'success'); this.loadMarks(); },
          error: () => Swal.fire(this.t('error'), this.t('somethingWentWrong'),'error')
        });
      }
    });
  }
  currentStep: number = 1;

nextStep() {
  if (!this.validateStep()) return;
  if (this.currentStep < 3) this.currentStep++;
}
validateStep(): boolean {
  const stepElement = document.querySelector(`.step-${this.currentStep}`);
  if (!stepElement) return true;

  const fields = stepElement.querySelectorAll('input[required], textarea[required]');
  let valid = true;

  fields.forEach((field: any) => {
    field.dispatchEvent(new Event('blur'));
    if (!field.value || field.value.toString().trim() === '') {
      valid = false;
    }
  });

  return valid;
}

prevStep() {
  if (this.currentStep > 1) this.currentStep--;
}

}
