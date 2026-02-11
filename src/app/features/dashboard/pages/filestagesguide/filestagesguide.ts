import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { FilestagesguideService, fileGuide } from './filestagesguide.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

type TranslationKey = keyof typeof EN | string;

@Component({
  selector: 'app-filestagesguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filestagesguide.html',
  styleUrls: ['./filestagesguide.css'],
})
export class Filestagesguide implements OnInit {
  translations: typeof EN = EN;

  // data
  allStages: fileGuide[] = [];
  displayedStages: fileGuide[] = [];

  // pagination & search
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  pagesArray: (number | string)[] = [];
  searchText: string = '';

  // modal / edit / add
  isModalOpen = false;
  isImportModalOpen = false;
  isExportModalOpen = false;
  currentStep = 1;
  isEditMode = false;
  editingId: number | null = null;
  newStage: Partial<fileGuide> = {};

  // import/upload
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  selectedExportOption: 'pdf' | 'excel' | null = null;

  // selection
selectedStage: fileGuide | undefined;

  constructor(
    private lang: TranslateService,
    private svc: FilestagesguideService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadStages(1);
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey) {
    return (this.translations as any)[key] || key;
  }

  // ---- API ----
  loadStages(page: number = 1) {
  this.svc.getAccountGuides(page, this.itemsPerPage, this.searchText).subscribe({
    next: (res: any) => {
      this.displayedStages = res.data.map((d: any) => ({
        ...d,
        selected: false
      }));

      this.totalItems = res.meta.total;
      this.totalPages = res.meta.pages;
      this.currentPage = res.meta.page;

      this.calculatePagination();
    },
    error: err => {
      console.error(err);
      Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
    }
  });
}

  // ---- Search / Filter ----
  onSearchInput() {
  this.currentPage = 1;
  this.loadStages(1);
}


  // ---- Pagination ----
  // updateDisplayedData() {
  //   const start = (this.currentPage - 1) * this.itemsPerPage;
  //   this.displayedStages = this.allStages.slice(start, start + this.itemsPerPage);
  // }

  goToPage(page: number | string) {
  if (typeof page === 'string') return;
  if (page >= 1 && page <= this.totalPages) {
    this.loadStages(page);
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.loadStages(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.loadStages(this.currentPage - 1);
  }
}

  goToPageInput(e: any) { const p = parseInt(e.target.value); if (!isNaN(p)) this.goToPage(p); }

  calculatePagination() {
    const t = this.totalPages;
    const c = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const withDots: (number | string)[] = [];
    let prev: number | undefined;

    range.push(1);
    for (let i = c - delta; i <= c + delta; i++) {
      if (i < t && i > 1) range.push(i);
    }
    range.push(t);

    const unique = [...new Set(range)].sort((a, b) => a - b);
    unique.forEach(i => {
      if (prev) {
        if (i - prev === 2) withDots.push(prev + 1);
        else if (i - prev !== 1) withDots.push('...');
      }
      withDots.push(i);
      prev = i;
    });

    this.pagesArray = withDots;
  }

  // ---- Selection & edit ----
  toggleSelection(stage: fileGuide) {
  (stage as any).selected = !(stage as any).selected;

  const selected = this.displayedStages.filter(s => (s as any).selected);

  // Edit يعمل فقط لو واحد
  this.selectedStage = selected.length === 1 ? selected[0] : undefined;
}

  toggleAll() {
    const allSelected = this.displayedStages.every(s => (s as any).selected);
    this.displayedStages.forEach(s => (s as any).selected = !allSelected);
  }

  selectForEdit(stage: fileGuide) {
    // mark selected in UI
    this.displayedStages.forEach(s => (s as any).selected = false);
    (stage as any).selected = true;
    this.selectedStage = stage;
  }

  openAddModal(stage?: fileGuide) {
  if (!stage && this.selectedStage) stage = this.selectedStage;

  this.isModalOpen = true;
  this.currentStep = 1;

  if (stage) {
    this.newStage = { ...stage };
    this.isEditMode = true;
    this.editingId = (stage as any).id || null;
  } else {
    this.newStage = {};
    this.isEditMode = false;
    this.editingId = null;
  }
}

  prevStep() { if (this.currentStep > 1) this.currentStep--; }
  nextStep() {
  if (!this.validateStep()) return;
  if (this.currentStep < 3) this.currentStep++;
}

validateStep(): boolean {
  const step = document.querySelector(`.step-${this.currentStep}`);
  if (!step) return false;

  const fields = step.querySelectorAll('input, textarea');
  let isValid = true;

  fields.forEach((field: any) => {
    // يجعل Angular يعتبره touched
    field.dispatchEvent(new Event('blur'));

    if (!field.value || !field.value.trim()) {
      field.classList.add('input-error');
      isValid = false;
    } else {
      field.classList.remove('input-error');
    }
  });

  return isValid;
}

  // ---- Create / Update ----
  submitStage() {
      if (!this.validateStep()) return;
    const payload: Partial<fileGuide> = {
      stageCode: this.newStage.stageCode || '',
      stage: this.newStage.stage || '',
      entityType: this.newStage.entityType || '',
      economicSector: this.newStage.economicSector || '',
      procedure: this.newStage.procedure || '',
      scopeOfProcedure: this.newStage.scopeOfProcedure || '',
      selectionMethod: this.newStage.selectionMethod || '',
      examplesOfUse: this.newStage.examplesOfUse || '',
      IAS: this.newStage.IAS || '',
      IFRS: this.newStage.IFRS || '',
      ISA: this.newStage.ISA || '',
      relevantPolicies: this.newStage.relevantPolicies || '',
      detailedExplanation: this.newStage.detailedExplanation || '',
      formsToBeCompleted: this.newStage.formsToBeCompleted || '',
      practicalProcedures: this.newStage.practicalProcedures || '',
      associatedRisks: this.newStage.associatedRisks || '',
      riskLevel: this.newStage.riskLevel || '',
      responsibleAuthority: this.newStage.responsibleAuthority || '',
      outputs: this.newStage.outputs || '',
      implementationPeriod: this.newStage.implementationPeriod || '',
      strengths: this.newStage.strengths || '',
      potentialWeaknesses: this.newStage.potentialWeaknesses || '',
      performanceIndicators: this.newStage.performanceIndicators || ''
    };

    // dates createdAt/updatedAt should be handled by backend; if you have date fields from form, include formatting here.

    if (this.editingId) {
      this.svc.updateAccountGuide(this.editingId, payload).subscribe({
        next: (res) => {
          Swal.fire(this.t('updated'), this.t('itemUpdatedSuccess') || 'Updated', 'success');
          this.closeModal();
          this.loadStages();
        },
        error: (err) => {
          console.error('Update error', err);
          Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
        }
      });
    } else {
      this.svc.createAccountGuide(payload).subscribe({
        next: () => {
          Swal.fire(this.t('created'), this.t('itemCreatedSuccess') || 'Created', 'success');
          this.closeModal();
          this.loadStages();
        },
        error: (err) => {
          console.error('Create error', err);
          Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
        }
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.newStage = {};
    this.currentStep = 1;
    this.editingId = null;
    this.isEditMode = false;
  }
deleteSelected() {
  const selected = this.displayedStages.filter(s => (s as any).selected);

  if (!selected.length) {
    Swal.fire(this.t('info'), this.t('noSelection') || 'No selection', 'info');
    return;
  }

  Swal.fire({
    title: this.t('confirmDelete'),
    text: `${this.t('areYouSureDelete')} ${selected.length} ${this.t('items') || ''}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: this.t('yesDelete') || 'Yes, delete',
    cancelButtonText: this.t('cancel') || 'Cancel'
  }).then(async result => {
    if (!result.isConfirmed) return;

    try {
      // 🔥 نفذ كل عمليات الحذف
      await Promise.all(
        selected.map(stage => {
          const id = (stage as any).id;
          return this.svc.deleteAccountGuide(id).toPromise();
        })
      );

      // 🧠 لو الصفحة الحالية فضيت → نرجع صفحة
      if (selected.length === this.displayedStages.length) {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      }

      // ✅ إعادة تحميل من السيرفر
      this.loadStages(this.currentPage);

      Swal.fire(
        this.t('deleted') || 'Deleted',
        this.t('itemDeletedSuccess') || 'Deleted successfully',
        'success'
      );

    } catch (err) {
      console.error('Delete error', err);
      Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
    }
  });
}

  // ---- Import / Export ----
  openImportModal() { this.isImportModalOpen = true; }
  closeImportModal() { this.isImportModalOpen = false; this.selectedFile = null; this.uploadProgress = 0; }

  onDragOver(e: DragEvent) { e.preventDefault(); }
  onFileDropped(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length) this.selectedFile = e.dataTransfer.files[0];
  }
  onFileSelected(e: any) { if (e.target.files.length) this.selectedFile = e.target.files[0]; }
  removeFile() { this.selectedFile = null; this.uploadProgress = 0; }

uploadFile() {
  if (!this.selectedFile) return;

  this.isUploading = true;
  this.uploadProgress = 0;

  this.svc.importAccountGuides(this.selectedFile).subscribe({
    next: event => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        this.isUploading = false;

        const res = event.body;

        let message = `تم تنفيذ عملية الاستيراد بنجاح ✅<br>`;
        let icon: 'success' | 'warning' | 'error' = 'success';

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

        Swal.fire({
          title: this.t('importResult') || 'نتيجة الاستيراد',
          html: message,
          icon: icon,
          confirmButtonText: this.t('ok') || 'حسناً',
          customClass: {
            container: 'swal-container' // 🔹 يرفع الـ z-index
          }
        });

        this.closeImportModal();
        this.loadStages();
      }
    },
    error: err => {
  this.isUploading = false;
  const errorMsg = err?.error?.error || err?.error?.message || this.t('somethingWentWrong');

  Swal.fire({
    title: this.t('error'),
    html: errorMsg,
    icon: 'error',
    confirmButtonText: this.t('ok'),
    // مرر الكلاس مباشرة كنص، وإذا لم يجد المودال سيستخدم الـ body تلقائياً
    target: '.import-modal-container'
  });
}
  });
}

  openExportModal() { this.isExportModalOpen = true; }
  closeExportModal() { this.isExportModalOpen = false; this.selectedExportOption = null; }

  selectExportOption(opt: 'pdf' | 'excel') { this.selectedExportOption = opt; }

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleExport() {
    if (!this.selectedExportOption) { Swal.fire(this.t('warning'), this.t('chooseFileType') || 'Choose file type', 'info'); return; }

    const selected = this.allStages.filter(s => (s as any).selected);

    if (selected.length === 1) {
      const id = (selected[0] as any).id;
      if (!id) return;
      if (this.selectedExportOption === 'pdf') {
        this.svc.exportSelectedPDF(id).subscribe(blob => this.downloadFile(blob, `stage_${id}.pdf`));
      } else {
        this.svc.exportSelectedExcel(id).subscribe(blob => this.downloadFile(blob, `stage_${id}.xlsx`));
      }
      this.closeExportModal();
      return;
    }

    // Export all
    if (this.selectedExportOption === 'pdf') this.svc.exportAllPDF().subscribe(blob => this.downloadFile(blob, 'stages.pdf'));
    if (this.selectedExportOption === 'excel') this.svc.exportAllExcel().subscribe(blob => this.downloadFile(blob, 'stages.xlsx'));
    this.closeExportModal();
  }

  // helper showing range
  get showingRangeText() {
  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems}`;
}

}
