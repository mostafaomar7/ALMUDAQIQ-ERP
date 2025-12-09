import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { ReviewguideService } from './reviewguide.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

type TranslationKey = keyof typeof EN;

interface ReviewItem {
  id: number;
  level: string;
  separator: string;
  number: string;
  statement: string;
  purpose: string;
  responsiblePerson: string;
  datePrepared: string;
  dateReviewed: string;
  conclusion: string;
  attachments: string;
  notes1: string;
  notes2: string;
  notes3: string;
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

  constructor(private lang: TranslateService , private reviewService: ReviewguideService) {}

  allReviews: ReviewItem[] = [];
  displayedReviews: ReviewItem[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  pagesArray: (number | string)[] = [];
  isModalOpen: boolean = false;
  currentStep: number = 1;
  isEditMode: boolean = false;
  editingId: number | null = null;
  newReview: Partial<ReviewItem> = {};
  selectedReview: ReviewItem | null = null;
isImportModalOpen: boolean = false;
selectedFile: File | null = null;
uploadProgress: number = 0;
isUploading: boolean = false;

isExportModalOpen: boolean = false;
selectedExportOption: string | null = null;
searchTerm: string = '';

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadReviews();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
  applySearch() {
  const term = this.searchTerm.toLowerCase();

  this.displayedReviews = this.allReviews
    .filter(item =>
      item.level.toLowerCase().includes(term) ||
      item.separator.toLowerCase().includes(term) ||
      item.number.toLowerCase().includes(term) ||
      item.statement.toLowerCase().includes(term) ||
      item.purpose.toLowerCase().includes(term) ||
      item.responsiblePerson.toLowerCase().includes(term) ||
      (item.datePrepared && item.datePrepared.toString().toLowerCase().includes(term)) ||
      (item.dateReviewed && item.dateReviewed.toString().toLowerCase().includes(term)) ||
      item.conclusion.toLowerCase().includes(term) ||
      item.attachments.toLowerCase().includes(term) ||
      item.notes1.toLowerCase().includes(term) ||
      item.notes2.toLowerCase().includes(term) ||
      item.notes3.toLowerCase().includes(term)
    )
    .slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);

  this.totalItems = this.allReviews.filter(item =>
    item.level.toLowerCase().includes(term) ||
    item.separator.toLowerCase().includes(term) ||
    item.number.toLowerCase().includes(term) ||
    item.statement.toLowerCase().includes(term) ||
    item.purpose.toLowerCase().includes(term) ||
    item.responsiblePerson.toLowerCase().includes(term) ||
    (item.datePrepared && item.datePrepared.toString().toLowerCase().includes(term)) ||
    (item.dateReviewed && item.dateReviewed.toString().toLowerCase().includes(term)) ||
    item.conclusion.toLowerCase().includes(term) ||
    item.attachments.toLowerCase().includes(term) ||
    item.notes1.toLowerCase().includes(term) ||
    item.notes2.toLowerCase().includes(term) ||
    item.notes3.toLowerCase().includes(term)
  ).length;

  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.calculatePagination();
}

  loadReviews() {
  this.reviewService.getAccountGuides().subscribe((res: any) => {
    const data = res.data || res;

    this.allReviews = data.map((item: any) => ({
      ...item,
      selected: false
    }));

    // ⭐ ترتيب مبدئي حسب level
    this.allReviews.sort((a, b) => Number(a.level) - Number(b.level));

    this.totalItems = this.allReviews.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedData();
    this.calculatePagination();
  });
}
sortAsc: boolean = true;

sortByLevel() {
  this.sortAsc = !this.sortAsc;

  this.allReviews.sort((a, b) => {
    const A = Number(a.level);
    const B = Number(b.level);

    // لو level نص وليس رقم، استخدم المقارنة النصية:
    if (isNaN(A) || isNaN(B)) {
      return this.sortAsc
        ? a.level.localeCompare(b.level)
        : b.level.localeCompare(a.level);
    }

    return this.sortAsc ? A - B : B - A;
  });

  this.updateDisplayedData();
}

  openAddModal(review?: ReviewItem) {
    this.isModalOpen = true;
    this.currentStep = 1;
    if (review) {
      this.newReview = { ...review };
      this.editingId = review.id;
      this.isEditMode = true;
    } else {
      this.newReview = {};
      this.editingId = null;
      this.isEditMode = false;
    }
  }

  prevStep() { if(this.currentStep>1) this.currentStep--; }
  nextStep() {
  if (!this.validateCurrentStep()) return;
  if (this.currentStep < 3) this.currentStep++;
}

 submitReview() {
  if (!this.validateCurrentStep()) return;
  if (this.editingId) {
    // تحضير كل الحقول
   const payload = {
  level: this.newReview.level || '',
  separator: this.newReview.separator || '',
  number: this.newReview.number || '',
  statement: this.newReview.statement || '',
  purpose: this.newReview.purpose || '',
  responsiblePerson: this.newReview.responsiblePerson || '',
  conclusion: this.newReview.conclusion || '',
  attachments: this.newReview.attachments || '',
  notes1: this.newReview.notes1 || '',
  notes2: this.newReview.notes2 || '',
  notes3: this.newReview.notes3 || '',
  datePrepared: this.formatDate(this.newReview.datePrepared),
  dateReviewed: this.formatDate(this.newReview.dateReviewed)
};

    // تحويل التواريخ لو موجودة
    if (this.newReview.datePrepared) {
      payload.datePrepared = this.formatDate(this.newReview.datePrepared);
    }
    if (this.newReview.dateReviewed) {
      payload.dateReviewed = this.formatDate(this.newReview.dateReviewed);
    }

    this.reviewService.updateAccountGuide(this.editingId, payload).subscribe({
      next: () => {
        Swal.fire('تم التحديث', 'تم تعديل البيان بنجاح!', 'success');
        this.closeModal();
        this.loadReviews();
      },
      error: (err) => {
        console.error(err); // لعرض الخطأ في الكونسل
        Swal.fire('خطأ', 'فشل تعديل البيان', 'error');
      }
    });
  } else {
    // إنشاء جديد
    const payload: any = {
      level: this.newReview.level || '',
      separator: this.newReview.separator || '',
      number: this.newReview.number || '',
      statement: this.newReview.statement || '',
      purpose: this.newReview.purpose || '',
      responsiblePerson: this.newReview.responsiblePerson || '',
      conclusion: this.newReview.conclusion || '',
      attachments: this.newReview.attachments || '',
      notes1: this.newReview.notes1 || '',
      notes2: this.newReview.notes2 || '',
      notes3: this.newReview.notes3 || ''
    };
    if (this.newReview.datePrepared) payload.datePrepared = this.formatDate(this.newReview.datePrepared);
    if (this.newReview.dateReviewed) payload.dateReviewed = this.formatDate(this.newReview.dateReviewed);

    this.reviewService.createAccountGuide(payload).subscribe({
      next: () => {
        Swal.fire('تم الإنشاء', 'تم إضافة البيان بنجاح!', 'success');
        this.closeModal();
        this.loadReviews();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('خطأ', 'فشل إضافة البيان', 'error');
      }
    });
  }
}

// دالة مساعدة لتحويل التاريخ
formatDate(date?: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
}

  closeModal() {
    this.isModalOpen = false;
    this.newReview = {};
    this.currentStep = 1;
    this.editingId = null;
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedReviews = this.allReviews.slice(start, end);
  }

  calculatePagination() {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number|string)[] = [];
    let l: number|undefined;
    range.push(1);
    for(let i=current-delta;i<=current+delta;i++){ if(i>1 && i<total) range.push(i);}
    range.push(total);
    [...new Set(range)].sort((a,b)=>a-b).forEach(i=>{
      if(l){ if(i-l===2) rangeWithDots.push(l+1); else if(i-l!==1) rangeWithDots.push('...'); }
      rangeWithDots.push(i); l=i;
    });
    this.pagesArray = rangeWithDots;
  }

  toggleSelection(item: ReviewItem){ item.selected=!item.selected; }
  toggleAll(){ const allSelected = this.displayedReviews.every(i=>i.selected); this.displayedReviews.forEach(i=>i.selected=!allSelected);}
selectForEdit(review: ReviewItem) {
  // إلغاء تحديد أي صفوف أخرى
  this.displayedReviews.forEach(r => r.selected = false);

  // تحديد الصف الحالي
  review.selected = true;
  this.selectedReview = review;
}

  deleteSelectedItems() {
    const selectedItems = this.allReviews.filter(i => i.selected);
    if(!selectedItems.length){ Swal.fire('Info', 'No items selected', 'info'); return; }
    Swal.fire({
      title:'Are you sure?', text:`You are about to delete ${selectedItems.length} items.`, icon:'warning',
      showCancelButton:true, confirmButtonText:'Yes, delete', cancelButtonText:'Cancel'
    }).then(result=>{
      if(result.isConfirmed){
        selectedItems.forEach(item=>{
          this.reviewService.deleteAccountGuide(item.id).subscribe(()=>{
            this.allReviews = this.allReviews.filter(i=>i.id!==item.id);
            this.updateDisplayedData();
          });
        });
        Swal.fire('Deleted!', `${selectedItems.length} items deleted.`, 'success');
      }
    });
  }

  goToPage(page:number|string){ if(typeof page==='string') return; if(page>=1 && page<=this.totalPages){ this.currentPage=page; this.updateDisplayedData(); this.calculatePagination(); } }
  nextPage(){ if(this.currentPage<this.totalPages){ this.currentPage++; this.updateDisplayedData(); this.calculatePagination(); } }
  prevPage(){ if(this.currentPage>1){ this.currentPage--; this.updateDisplayedData(); this.calculatePagination(); } }
  goToPageInput(event:any){ const page = parseInt(event.target.value); if(!isNaN(page)) this.goToPage(page); }

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf') || 'of'} ${this.totalItems.toLocaleString()}`;
  }
  openImportModal() { this.isImportModalOpen = true; }
closeImportModal() { this.isImportModalOpen = false; this.selectedFile = null; this.uploadProgress = 0; }

onDragOver(event: DragEvent) { event.preventDefault(); }

onFileDropped(event: DragEvent) {
  event.preventDefault();
  if(event.dataTransfer?.files.length) this.selectedFile = event.dataTransfer.files[0];
}

onFileSelected(event: any) {
  if(event.target.files.length) this.selectedFile = event.target.files[0];
}

removeFile() {
  this.selectedFile = null;
  this.uploadProgress = 0;
}

uploadFile() {
  if(!this.selectedFile) return;
  this.isUploading = true;
  this.uploadProgress = 0;

  this.reviewService.iimportReviewGuides(this.selectedFile).subscribe({
    next: event => {
      if(event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded)/event.total);
      } else if(event.type === HttpEventType.Response) {
        this.isUploading = false;
        Swal.fire('Success', 'تم رفع الملف بنجاح', 'success');
        this.closeImportModal();
        this.loadReviews();
      }
    },
    error: err => {
      this.isUploading = false;
      Swal.fire('Error', 'فشل رفع الملف', 'error');
    }
  });
}
openExportModal() { this.isExportModalOpen = true; }
closeExportModal() { this.isExportModalOpen = false; this.selectedExportOption = null; }

selectExportOption(option: string) { this.selectedExportOption = option; }

downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

handleExport() {
  if(!this.selectedExportOption) {
    Swal.fire('تنبيه','من فضلك اختر نوع الملف','info');
    return;
  }

  const selected = this.displayedReviews.filter(r => r.selected);

  if(selected.length === 1) {
    const id = selected[0].id;
    if(this.selectedExportOption==='pdf') this.reviewService.exportSelectedPDF(id).subscribe(blob => this.downloadFile(blob, `review_${id}.pdf`));
    if(this.selectedExportOption==='excel') this.reviewService.exportSelectedExcel(id).subscribe(blob => this.downloadFile(blob, `review_${id}.xlsx`));
    this.closeExportModal();
    return;
  }

  // Export All
  if(this.selectedExportOption==='pdf') this.reviewService.exportAllPDF().subscribe(blob => this.downloadFile(blob, 'reviews.pdf'));
  if(this.selectedExportOption==='excel') this.reviewService.exportAllExcel().subscribe(blob => this.downloadFile(blob, 'reviews.xlsx'));

  this.closeExportModal();
}
validateCurrentStep(): boolean {
  const step = document.querySelector(`.step-${this.currentStep}`);
  if (!step) return false;

  const inputs = step.querySelectorAll('input, textarea');
  let valid = true;

  inputs.forEach((input: any) => {
    // يجعل Angular يعتبر الحقل touched
    input.dispatchEvent(new Event('blur'));

    if (!input.value || !input.value.trim()) {
      input.classList.add('input-error');
      valid = false;
    } else {
      input.classList.remove('input-error');
    }
  });

  return valid;
}


}
