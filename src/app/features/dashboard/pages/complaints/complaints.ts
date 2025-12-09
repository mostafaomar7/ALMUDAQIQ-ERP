import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateService } from '../../../../core/services/translate.service';
import { ComplaintsService } from './complaints.service';

import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import Swal from 'sweetalert2';

type TranslationKey = keyof typeof EN;

interface Complaint {
  id: number;
  subscriberId: number;
  subscriberName: string;
  phone: string;
  email: string;
  message: string;
  type: string;
  complaintDate: string;
  respondedAt?: string;
  response?: string;
  subscriber?: {
    id: number;
    subdomain: string;
  };
  selected :boolean;
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

  showComplaintModal = false;
  selectedComplaint: Complaint | null = null;

  Math = Math;

  // === API DATA ===
  complaintsData: Complaint[] = [];

  // === Pagination ===
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  goToPageInput: number | null = 1;

  // === Search & Filters ===
  searchText = '';
  filterType = '';
  fromDate = '';
  toDate = '';

  // === UI State ===
  loading = false;
  errorMessage = '';

  constructor(
    private languageService: TranslateService,
    private api: ComplaintsService
  ) {}

  ngOnInit(): void {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
    this.fetchComplaints(); // أول تحميل
  }

  // =========================
  //       GET Complaints
  // =========================
  fetchComplaints(page: number = this.currentPage) {
    this.loading = true;
    this.errorMessage = '';

    const params = {
      page,
      limit: this.itemsPerPage,
      search: this.searchText || '',
      type: this.filterType || '',
      startDate: this.fromDate || '',
      endDate: this.toDate || ''
    };

    this.api.getComplaints(params).subscribe({
      next: (res: any) => {
        this.loading = false;

        this.complaintsData = res.data || [];
        this.totalItems = res.total || 0;
        this.currentPage = res.page || page;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load complaints.';
      }
    });
  }

  // =========================
  //   Search & Filters
  // =========================
  onSearch() {
    this.currentPage = 1;
    this.fetchComplaints();
  }

  applyFilters() {
    this.currentPage = 1;
    this.fetchComplaints();
  }

  // =========================
  //       Pagination
  // =========================
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
      this.fetchComplaints();
    }
  }

  goToPage() {
    if (this.goToPageInput) {
      this.changePage(this.goToPageInput);
      this.goToPageInput = null;
    }
  }

  // =========================
  //       MODAL
  // =========================
  openComplaintDetails(complaint: Complaint) {
    this.selectedComplaint = complaint;
    this.showComplaintModal = true;
  }

  closeComplaintDetails() {
    this.showComplaintModal = false;
    this.selectedComplaint = null;
  }

  // =========================
  //       Translation
  // =========================
  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey) {
    return this.translations[key] || key;
  }
  // إضافة state جديد للرد
showRespondModal = false;
responseText: string = '';

// فتح وغلق مودال الرد
openRespondModal(complaint: Complaint) {
  this.selectedComplaint = complaint;
  this.responseText = complaint.response || '';
  this.showRespondModal = true;
}

closeRespondModal() {
  this.showRespondModal = false;
  this.selectedComplaint = null;
  this.responseText = '';
}
sendResponse() {
  if (!this.selectedComplaint || !this.responseText.trim()) return;

  this.loading = true;

  this.api.respondComplaint(this.selectedComplaint.id, { response: this.responseText })
    .subscribe({
      next: (res) => {
        this.loading = false;
        this.fetchComplaints(); // تحديث الجدول
        this.closeRespondModal();

        // SweetAlert نجاح
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Response sent successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        this.loading = false;

        // SweetAlert خطأ
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send response.',
        });
      }
    });
}
deleteSelected() {
  const selectedAccounts = this.complaintsData.filter(a => a.selected);

  if (selectedAccounts.length === 0) {
    Swal.fire('No selection', 'Please select at least one row to delete.', 'info');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to delete ${selectedAccounts.length} account(s).`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      selectedAccounts.forEach((acc: Complaint) => {
        this.api.deleteComplaints(acc.id).subscribe({
          next: () => {
            this.complaintsData = this.complaintsData.filter((a: Complaint) => a.id !== acc.id);
            this.fetchComplaints(); // تحديث الجدول
          },
          error: (err: any) => console.error(`Error deleting account ${acc.id}:`, err)
        });
      });

      Swal.fire('Deleted!', 'Selected account(s) have been deleted.', 'success');
    }
  });
}

}
