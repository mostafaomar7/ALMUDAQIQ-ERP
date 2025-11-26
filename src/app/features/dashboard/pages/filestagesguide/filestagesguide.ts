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
  selectedStage: fileGuide | null = null;

  constructor(
    private lang: TranslateService,
    private svc: FilestagesguideService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadStages();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey) {
    return (this.translations as any)[key] || key;
  }

  // ---- API ----
  loadStages() {
    this.svc.getAccountGuides().subscribe({
      next: (res: any) => {
        // assume res.data or res as array
        const data: fileGuide[] = (res && (res.data || res)) || [];
        this.allStages = data.map(d => ({ ...d }));
        this.totalItems = this.allStages.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
        this.currentPage = 1;
        this.updateDisplayedData();
        this.calculatePagination();
      },
      error: (err) => {
        console.error('Load stages error', err);
        Swal.fire(this.t('error'), this.t('somethingWentWrong'), 'error');
      }
    });
  }

  // ---- Search / Filter ----
  onSearchInput() {
    const text = (this.searchText || '').toLowerCase().trim();
    if (!text) {
      this.totalItems = this.allStages.length;
      this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
      this.currentPage = 1;
      this.updateDisplayedData();
      this.calculatePagination();
      return;
    }

    const filtered = this.allStages.filter(s => {
      // check a few representative fields; extend as needed
      return (
        (s.stageCode || '').toLowerCase().includes(text) ||
        (s.stage || '').toLowerCase().includes(text) ||
        (s.entityType || '').toLowerCase().includes(text) ||
        (s.economicSector || '').toLowerCase().includes(text) ||
        (s.procedure || '').toLowerCase().includes(text) ||
        (s.responsibleAuthority || '').toLowerCase().includes(text)
      );
    });

    this.displayedStages = filtered;
    this.totalItems = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    this.calculatePagination();
  }

  // ---- Pagination ----
  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedStages = this.allStages.slice(start, start + this.itemsPerPage);
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
  nextStep() { if (this.currentStep < 3) this.currentStep++; }


  // ---- Create / Update ----
  submitStage() {
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

  // ---- Delete selected ----
  deleteSelected() {
    const selected = this.allStages.filter(s => (s as any).selected);
    if (selected.length === 0) { Swal.fire(this.t('info'), this.t('noSelection') || 'No selection', 'info'); return; }

    Swal.fire({
      title: this.t('confirmDelete'),
      text: `${this.t('areYouSureDelete')} ${selected.length} ${this.t('items') || ''}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.t('yesDelete') || 'Yes, delete',
      cancelButtonText: this.t('cancel') || 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        selected.forEach(s => {
          const id = (s as any).id;
          if (!id) return;
          this.svc.deleteAccountGuide(id).subscribe({
            next: () => {
              this.allStages = this.allStages.filter(x => (x as any).id !== id);
              this.updateDisplayedData();
            },
            error: (err) => console.error('Delete error', err)
          });
        });
        Swal.fire(this.t('deleted') || 'Deleted', this.t('itemDeletedSuccess') || 'Deleted', 'success');
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
          Swal.fire(this.t('success'), this.t('fileUploaded') || 'File uploaded', 'success');
          this.closeImportModal();
          this.loadStages();
        }
      },
      error: err => {
        this.isUploading = false;
        console.error('Import error', err);
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
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
}
