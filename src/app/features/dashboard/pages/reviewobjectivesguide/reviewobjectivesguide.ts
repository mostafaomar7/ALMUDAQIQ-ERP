import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { ReviewobjectivesService, ReviewObjectives } from './reviewobjectives.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

type TranslationKey = keyof typeof EN | string;

@Component({
  selector: 'app-reviewobjectivesguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviewobjectivesguide.html',
  styleUrls: ['./reviewobjectivesguide.css'],
})
export class Reviewobjectivesguide implements OnInit {
  translations: typeof EN = EN;

  // data
  allGuides: ReviewObjectives[] = [];
  displayedGuides: ReviewObjectives[] = [];

  // pagination & search
  currentPage = 1;
  itemsPerPage = 12;
  totalItems = 0;
  totalPages = 0;
  pagesArray: (number | string)[] = [];
  searchText = '';

  // modal / edit / add (3 steps)
  isModalOpen = false;
  currentStep = 1;
  isEditMode = false;
  editingId: number | null = null;
  newGuide: Partial<ReviewObjectives> = {};

  // import/export
  isImportModalOpen = false;
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;

  isExportModalOpen = false;
  selectedExportOption: 'pdf' | 'excel' | null = null;

  // selection
  selectedAny: boolean = false;

  constructor(
    private lang: TranslateService,
    private svc: ReviewobjectivesService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadGuides();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey) {
    return (this.translations as any)[key] || key;
  }

  // ---- API ----
  loadGuides() {
    this.svc.getReviewObjectives().subscribe({
      next: (res: any) => {
        const arr: ReviewObjectives[] = (res && (res.data || res)) || [];
        // ensure selected flag exists
        this.allGuides = arr.map(a => ({ ...a, selected: false }));
        this.totalItems = this.allGuides.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
        this.currentPage = 1;
        this.updateDisplayedData();
        this.calculatePagination();
      },
      error: err => {
        console.error('Load error', err);
        Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
      }
    });
  }

  // ---- Search ----
  onSearchInput() {
    const text = (this.searchText || '').toLowerCase().trim();
    if (!text) {
      this.totalItems = this.allGuides.length;
      this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
      this.currentPage = 1;
      this.updateDisplayedData();
      this.calculatePagination();
      return;
    }

    const filtered = this.allGuides.filter(x =>
      (x.codesCollected || '').toLowerCase().includes(text) ||
      (x.notes || '').toLowerCase().includes(text) ||
      (x.policies || '').toLowerCase().includes(text) ||
      (x.codeOfEthics || '').toLowerCase().includes(text) ||
      (x.ifrs || '').toLowerCase().includes(text) ||
      (x.ias || '').toLowerCase().includes(text)
    );

    this.displayedGuides = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    this.calculatePagination();
  }

  // ---- Pagination ----
  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedGuides = this.allGuides.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number | string) {
    if (typeof page === 'string') return;
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.updateDisplayedData(); this.calculatePagination(); } }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.updateDisplayedData(); this.calculatePagination(); } }
  goToPageInput(e: any) { const p = parseInt(e.target.value); if (!isNaN(p)) this.goToPage(p); }

  calculatePagination() {
    const t = this.totalPages;
    const c = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const withDots: (number | string)[] = [];
    let prev: number | undefined;

    range.push(1);
    for (let i = c - delta; i <= c + delta; i++) if (i < t && i > 1) range.push(i);
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

  // ---- Selection ----
  toggleSelection(item: ReviewObjectives) {
    item.selected = !item.selected;
    this.selectedAny = this.allGuides.some(x => x.selected);
  }

  toggleAll() {
    const allSelected = this.displayedGuides.every(d => d.selected);
    this.displayedGuides.forEach(d => d.selected = !allSelected);
    // update master list too
    this.displayedGuides.forEach(d => {
      const idx = this.allGuides.findIndex(x => x.id === d.id);
      if (idx >= 0) this.allGuides[idx].selected = d.selected;
    });
    this.selectedAny = this.allGuides.some(x => x.selected);
  }

  // ---- Edit / Add modal (3 steps) ----
  openAddModal(item?: ReviewObjectives) {
    this.isModalOpen = true;
    this.currentStep = 1;
    if (item) {
      this.newGuide = { ...item };
      this.isEditMode = true;
      this.editingId = item.id || null;
    } else {
      this.newGuide = {};
      this.isEditMode = false;
      this.editingId = null;
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.newGuide = {};
    this.currentStep = 1;
    this.isEditMode = false;
    this.editingId = null;
  }

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
    if (!field.value || field.value.trim() === '') {
      valid = false;
    }
  });

  return valid;
}

  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  submitGuide() {
      if (!this.validateStep()) return;

    const payload: Partial<ReviewObjectives> = {
  codesCollected: this.newGuide.codesCollected || '',

  ethicalCompliancePercentage: this.newGuide.ethicalCompliancePercentage
    ? parseFloat(this.newGuide.ethicalCompliancePercentage as any)
    : null,

  professionalPlanningPercentage: this.newGuide.professionalPlanningPercentage
    ? parseFloat(this.newGuide.professionalPlanningPercentage as any)
    : null,

  internalControlPercentage: this.newGuide.internalControlPercentage
    ? parseFloat(this.newGuide.internalControlPercentage as any)
    : null,

  evidencePercentage: this.newGuide.evidencePercentage
    ? parseFloat(this.newGuide.evidencePercentage as any)
    : null,

  evaluationPercentage: this.newGuide.evaluationPercentage
    ? parseFloat(this.newGuide.evaluationPercentage as any)
    : null,

  documentationPercentage: this.newGuide.documentationPercentage
    ? parseFloat(this.newGuide.documentationPercentage as any)
    : null,

  actualPerformance: this.newGuide.actualPerformance
    ? parseFloat(this.newGuide.actualPerformance as any)
    : null,

  implementationStatus: this.newGuide.implementationStatus || '',
  codeOfEthics: this.newGuide.codeOfEthics || '',
  policies: this.newGuide.policies || '',
  ifrs: this.newGuide.ifrs || '',
  ias: this.newGuide.ias || '',
  notes: this.newGuide.notes || ''
};


    if (this.isEditMode && this.editingId) {
      this.svc.updateReviewObjectives(this.editingId, payload).subscribe({
        next: () => { Swal.fire(this.t('updated'), this.t('itemUpdatedSuccess') || 'Updated','success'); this.closeModal(); this.loadGuides(); },
        error: err => { console.error(err); Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error'); }
      });
    } else {
      this.svc.createReviewObjectives(payload).subscribe({
        next: () => { Swal.fire(this.t('created'), this.t('itemCreatedSuccess') || 'Created','success'); this.closeModal(); this.loadGuides(); },
        error: err => { console.error(err); Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error'); }
      });
    }
  }

  // ---- Delete selected ----
  deleteSelected() {
    const selected = this.allGuides.filter(g => g.selected);
    if (!selected.length) { Swal.fire(this.t('info'), this.t('noSelection') || 'No selection','info'); return; }

    Swal.fire({
      title: this.t('confirmDelete'),
      text: `${this.t('areYouSureDelete')} ${selected.length}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.t('yesDelete') || 'Yes, delete',
      cancelButtonText: this.t('cancel') || 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        selected.forEach(s => {
          if (!s.id) return;
          this.svc.deleteReviewObjectives(s.id).subscribe({
            next: () => {
              this.allGuides = this.allGuides.filter(x => x.id !== s.id);
              this.updateDisplayedData();
            },
            error: err => console.error('Delete err', err)
          });
        });
        Swal.fire(this.t('deleted') || 'Deleted', this.t('itemDeletedSuccess') || 'Deleted', 'success');
      }
    });
  }

  // ---- Import / Export ----
  openImportModal() { this.isImportModalOpen = true; }
  closeImportModal() { this.isImportModalOpen = false; this.selectedFile = null; this.uploadProgress = 0; }

  onFileSelected(e: any) { if (e.target.files?.length) this.selectedFile = e.target.files[0]; }
  onFileDropped(e: DragEvent) { e.preventDefault(); if (e.dataTransfer?.files.length) this.selectedFile = e.dataTransfer.files[0]; }
  onDragOver(e: DragEvent) { e.preventDefault(); }

  uploadFile() {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.uploadProgress = 0;
    this.svc.iimportReviewObjectives(this.selectedFile).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          Swal.fire(this.t('success'), this.t('fileUploaded') || 'File uploaded','success');
          this.closeImportModal();
          this.loadGuides();
        }
      },
      error: err => {
        this.isUploading = false;
        console.error('Import err', err);
        Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
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
    if (!this.selectedExportOption) { Swal.fire(this.t('warning'), this.t('chooseFileType') || 'Choose file type','info'); return; }
    const selected = this.allGuides.filter(g => g.selected);
    if (selected.length === 1 && selected[0].id) {
      const id = selected[0].id;
      if (this.selectedExportOption === 'pdf') this.svc.exportSelectedPDF(id).subscribe((blob: any) => this.downloadFile(blob, `objectives_${id}.pdf`));
      else this.svc.exportSelectedExcel(id).subscribe((blob: any) => this.downloadFile(blob, `objectives_${id}.xlsx`));
      this.closeExportModal();
      return;
    }
    if (this.selectedExportOption === 'pdf') this.svc.exportAllPDF().subscribe((blob: any) => this.downloadFile(blob, 'objectives.pdf'));
    if (this.selectedExportOption === 'excel') this.svc.exportAllExcel().subscribe((blob: any) => this.downloadFile(blob, 'objectives.xlsx'));
    this.closeExportModal();
  }

  // helper
  get showingRangeText() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }

  get hasSelection(): boolean {
  return this.allGuides.some(g => g.selected);
}
get selectedGuide(): ReviewObjectives | undefined {
  return this.allGuides.find(g => g.selected);
}

removeFile() {
  this.selectedFile = null;
  this.uploadProgress = 0;
}

}
