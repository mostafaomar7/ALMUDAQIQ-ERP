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
  selectedReview?: ReviewItem;
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
  console.log('searchTerm:', this.searchTerm);
  this.currentPage = 1;
  this.loadReviews(1);
}

loadReviews(page: number = 1) {
  this.reviewService
    .getAccountGuides(page, this.itemsPerPage, this.searchTerm)
    .subscribe({
      next: (res: any) => {
        const list: ReviewItem[] = (res?.data ?? []).map((item: any) => ({
          ...item,
          selected: false
        }));

        this.displayedReviews = list;

        const meta = res?.meta ?? {};

        this.currentPage = meta.page ?? page;
        this.totalItems = meta.total ?? list.length;

        // لو عايز تمشي بـ limit بتاع السيرفر
        this.itemsPerPage = meta.limit ?? this.itemsPerPage;

        this.totalPages =
          meta.totalPages ?? Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));

        this.calculatePagination();

        // ✅ لو الصفحة الحالية بقت خارج النطاق بعد حذف/بحث
        if (this.currentPage > this.totalPages) {
          this.loadReviews(this.totalPages);
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to load reviews', 'error');
        this.displayedReviews = [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.currentPage = page;
        this.calculatePagination();
      }
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

  // this.updateDisplayedData();
}
formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
openAddModal(review?: ReviewItem) {
  this.isModalOpen = true;
  this.currentStep = 1;

  if (review) {
    this.isEditMode = true;
    this.editingId = review.id;

    this.newReview = {
      ...review,
      datePrepared: review.datePrepared ? this.formatDateForInput(review.datePrepared) : '',
      dateReviewed: review.dateReviewed ? this.formatDateForInput(review.dateReviewed) : ''
    };
  } else {
    this.isEditMode = false;
    this.editingId = null;
    this.newReview = {
      level: '',
      separator: '',
      number: '',
      statement: '',
      purpose: '',
      responsiblePerson: '',
      conclusion: '',
      attachments: '',
      notes1: '',
      notes2: '',
      notes3: '',
      datePrepared: '',
      dateReviewed: ''
    };
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
  let message = 'فشل تعديل البيان';

  if (err?.error) {
    message =
      err.error.message ||
      err.error.error ||
      err.error ||
      message;
  }

 // @ts-ignore
Swal.fire({
  title: 'خطأ',
  text: message,
  icon: 'error',
  confirmButtonText: 'حسناً',
  appendTo: document.body
});

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
  let message = 'فشل إضافة البيان';

  if (err?.error) {
    message =
      err.error.message ||
      err.error.error ||
      err.error ||
      message;
  }

  this.closeModal(); // مهم جدًا

  setTimeout(() => {
    // @ts-ignore
Swal.fire({
  title: 'خطأ',
  text: message,
  icon: 'error',
  confirmButtonText: 'حسناً',
  appendTo: document.body
});

  }, 0);
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
// updateDisplayedData() {
//   const term = this.searchTerm.toLowerCase();

//   const filtered = this.allReviews.filter(item =>
//     item.level.toLowerCase().includes(term) ||
//     item.separator.toLowerCase().includes(term) ||
//     item.number.toLowerCase().includes(term) ||
//     item.statement.toLowerCase().includes(term) ||
//     item.purpose.toLowerCase().includes(term) ||
//     item.responsiblePerson.toLowerCase().includes(term) ||
//     (item.datePrepared && item.datePrepared.toString().toLowerCase().includes(term)) ||
//     (item.dateReviewed && item.dateReviewed.toString().toLowerCase().includes(term)) ||
//     item.conclusion.toLowerCase().includes(term) ||
//     item.attachments.toLowerCase().includes(term) ||
//     item.notes1.toLowerCase().includes(term) ||
//     item.notes2.toLowerCase().includes(term) ||
//     item.notes3.toLowerCase().includes(term)
//   );

//   this.totalItems = filtered.length;
//   this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

//   const start = (this.currentPage - 1) * this.itemsPerPage;
//   const end = start + this.itemsPerPage;
//   this.displayedReviews = filtered.slice(start, end);

//   this.calculatePagination();
// }

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

toggleSelection(item: ReviewItem) {
  item.selected = !item.selected;
  this.selectedReview = item.selected ? item : undefined;
}

  toggleAll(){ const allSelected = this.displayedReviews.every(i=>i.selected); this.displayedReviews.forEach(i=>i.selected=!allSelected);}
selectForEdit(review: ReviewItem) {
  this.selectedReview = review;
  this.openAddModal(review); // هنا النوع متوافق
}

deleteSelectedItems() {
  const selectedItems = this.displayedReviews.filter(i => i.selected);

  if (!selectedItems.length) {
    Swal.fire('Info', 'No items selected', 'info');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedItems.length} items.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel'
  }).then(async result => {
    if (!result.isConfirmed) return;

    try {
      // 🔥 نفذ كل الحذف الأول
      await Promise.all(
        selectedItems.map(item =>
          this.reviewService.deleteAccountGuide(item.id).toPromise()
        )
      );

      // 🧠 لو الصفحة فضيت → نرجع صفحة
      if (selectedItems.length === this.displayedReviews.length) {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      }

      // ✅ إعادة تحميل من السيرفر
// ✅ إعادة تحميل من السيرفر + تصحيح الصفحة لو بقت خارج النطاق
this.loadReviews(this.currentPage);

// بعد ما الريلود يخلص ويحسب totalPages، ممكن تكون currentPage بقت أكبر من totalPages
setTimeout(() => {
  if (this.currentPage > this.totalPages) {
    this.loadReviews(this.totalPages);
  }
}, 0);
      Swal.fire('Deleted!', `${selectedItems.length} items deleted.`, 'success');

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to delete items', 'error');
    }
  });
}

goToPage(page: number|string) {
  if (typeof page === 'string') return;
  if (page >= 1 && page <= this.totalPages) {
    this.loadReviews(page); // نجلب الصفحة الجديدة من السيرفر
  }
}
  nextPage() {
  if (this.currentPage < this.totalPages) {
    this.loadReviews(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.loadReviews(this.currentPage - 1);
  }
}

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
  if (!this.selectedFile) return;

  this.isUploading = true;
  this.uploadProgress = 0;

  this.reviewService.iimportReviewGuides(this.selectedFile).subscribe({
    next: event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.isUploading = false;

        const res = event.body;

        let message = 'تم رفع الملف بنجاح ✅';
        let icon: any = 'success';

        // لو في أخطاء أو صفوف متخطاة
        if (res.imported || res.skipped || res.errors) {
          message = '';
          if (res.imported > 0) {
            message += `✔ تم استيراد <b>${res.imported}</b> صف<br>`;
          }
          if (res.skipped > 0) {
            message += `⚠ تم تخطي <b>${res.skipped}</b> صف (مكرر)<br>`;
            icon = 'warning';
          }
          if (res.errors > 0) {
            message += `❌ يوجد <b>${res.errors}</b> أخطاء`;
            icon = 'error';
          }
        }

        this.closeImportModal();
        this.loadReviews();

        // 🔥 هذا يضمن ظهور الـ SweetAlert فوق أي مودال
        // @ts-ignore
        Swal.fire({
          icon: icon,
          title: icon === 'success' ? 'نجاح' : 'نتيجة الاستيراد',
          html: message,
          confirmButtonText: 'حسناً',
          appendTo: document.body
        });
      }
    },
    error: err => {
      this.isUploading = false;

      const errorMsg = err?.error?.error || err?.error?.message || 'حدث خطأ غير متوقع';

      this.closeImportModal();

      // @ts-ignore
      Swal.fire({
        icon: 'error',
        title: 'خطأ أثناء الاستيراد',
        html: errorMsg,
        confirmButtonText: 'حسناً',
        appendTo: document.body
      });
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
