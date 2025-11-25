import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { AccountguideService, AccountGuide } from './accountguide.service';
import Swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';

type TranslationKey = keyof typeof EN | string;

interface DisplayAccount {
  id: number;
  name: string;
  level: string;
  number: string;
  rules: string;
  notes: string;
  code: string;
  selected: boolean;
  relatedObjectives: string;
  objectiveCode: string;
}

@Component({
  selector: 'app-accountsguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accountsguide.html',
  styleUrls: ['./accountsguide.css'],
})
export class Accountsguide implements OnInit {
  isModalOpen: boolean = false;
  currentStep: number = 1;
  translations: typeof EN = EN;
isEditMode: boolean = false;
editingAccountId: number | null = null;

  allAccounts: DisplayAccount[] = [];
  displayedAccounts: DisplayAccount[] = [];
selectedAccount: DisplayAccount | null = null;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  pagesArray: (number | string)[] = [];
 newAccount : any = {
    level: '',
    accountNumber: '',
    accountName: '',
    rulesAndRegulations: '',
    disclosureNotes: '',
    code1: '',
    // code2: null,
    // code3: null,
    // code4: null,
    // code5: null,
    // code6: null,
    // code7: null,
    // code8: null,
    objectiveCode: '',
    relatedObjectives: ''
  };
  searchText: string = '';
editingId: number | null = null;
isImportModalOpen: boolean = false;
selectedFile: File | null = null;
uploadProgress: number = 0;
isUploading: boolean = false;
isExportModalOpen: boolean = false;
selectedExportOption: string | null = null;

  constructor(
    private lang: TranslateService,
    private accountService: AccountguideService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe(l => this.loadTranslations(l));
    this.loadAccounts();
  }
openAddModal(account?: DisplayAccount | null) {
  this.isModalOpen = true;
  this.currentStep = 1;

  if (account) {
    this.newAccount = {
      id: account.id,
      level: account.level || '',
      accountNumber: Number(account.number) || '',
      accountName: account.name || '',
      rulesAndRegulations: account.rules || '',
      disclosureNotes: account.notes || '',
      code1: account.code || '',
      objectiveCode: account.objectiveCode || '',
      relatedObjectives: account.relatedObjectives || ''
    };
    this.editingId = account.id;
    this.isEditMode = true;
  } else {
    this.newAccount = {
      level: '',
      accountNumber: '',
      accountName: '',
      rulesAndRegulations: '',
      disclosureNotes: '',
      code1: '',
      objectiveCode: '',
      relatedObjectives: ''
    };
    this.editingId = null;
    this.isEditMode = false;
  }
}
openImportModal() {
  this.isImportModalOpen = true;
}

closeImportModal() {
  this.isImportModalOpen = false;
}

  // 🆕 إغلاق المودال
  closeModal() {
    this.isModalOpen = false;
    this.newAccount = {};
    this.currentStep = 1;
  }
filterAccounts() {
  const text = (this.searchText || '').toLowerCase().trim();

  if (!text) {
    this.updateDisplayedData(); // لو البحث فاضي، نعرض البيانات الأصلية
    return;
  }

  const filtered = this.allAccounts.filter(acc => {
    // نتحقق لكل حقل أنه موجود قبل التحويل لـ lowercase أو string
    return (
      (acc.name?.toLowerCase().includes(text)) ||
      (acc.level?.toLowerCase().includes(text)) ||
      (acc.number?.toString().includes(text)) ||
      (acc.rules?.toLowerCase().includes(text)) ||
      (acc.notes?.toLowerCase().includes(text)) ||
      (acc.code?.toLowerCase().includes(text)) ||
      (acc.objectiveCode?.toLowerCase().includes(text)) ||
      (acc.relatedObjectives?.toLowerCase().includes(text))
    );
  });

  this.displayedAccounts = filtered;
  this.totalItems = filtered.length;
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.calculatePagination();
}

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: keyof typeof EN | string): string {
  return (this.translations as any)[key] || key;
}


  loadAccounts() {
  this.accountService.getAccountGuides().subscribe({
    next: (res: any) => {
      const dataArray: AccountGuide[] = res.data || []; // نجيب المصفوفة من المفتاح data
      this.allAccounts = dataArray.map(a => ({
        id: a.id,
        name: a.accountName || '',
        level: a.level,
        number: a.accountNumber.toString(),
        rules: a.rulesAndRegulations || '',
        notes: a.disclosureNotes || '',
        code: a.code1 || '',
        objectiveCode : a.objectiveCode,
        relatedObjectives : a.relatedObjectives,
        selected: false
      }));

      this.totalItems = this.allAccounts.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.updateDisplayedData();
      this.calculatePagination();
    },
    error: (err) => console.error('Error fetching accounts:', err)
  });
}

deleteSelected() {
  const selectedAccounts = this.displayedAccounts.filter(a => a.selected);

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
      // تنفيذ الحذف
      selectedAccounts.forEach(acc => {
        this.accountService.deleteAccountGuide(acc.id).subscribe({
          next: () => {
            // إزالة الصف من الـ arrays
            this.allAccounts = this.allAccounts.filter(a => a.id !== acc.id);
            this.updateDisplayedData();
            this.calculatePagination();
          },
          error: (err) => console.error(`Error deleting account ${acc.id}:`, err)
        });
      });

      Swal.fire('Deleted!', 'Selected account(s) have been deleted.', 'success');
    }
  });
}


  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedAccounts = this.allAccounts.slice(start, start + this.itemsPerPage);
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

  goToPageInput(e: any) {
    const p = parseInt(e.target.value);
    if (!isNaN(p)) this.goToPage(p);
  }

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

toggleSelection(acc: DisplayAccount) {
  acc.selected = !acc.selected; // تفعيل/إلغاء التحديد
}
toggleAll() {
  const allSelected = this.displayedAccounts.every(a => a.selected);
  this.displayedAccounts.forEach(a => a.selected = !allSelected);
}

  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
  }
  nextStep() {
    // 💡 يمكن إضافة تحقق هنا قبل الانتقال للخطوة التالية (مثل التحقق من صحة البيانات المدخلة في الخطوة الحالية)
    if (this.currentStep < 3) { // 3 هي العدد الكلي للخطوات
      this.currentStep++;
    }
  }

  // 🆕 للعودة إلى الخطوة السابقة
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  selectForEdit(account: DisplayAccount) {
  // إذا كنت تريد أن تسمح بتحديد صف واحد فقط:
  this.displayedAccounts.forEach(a => a.selected = false);
  account.selected = true;
  this.selectedAccount = account;
}
submitNewAccount() {
  if (this.editingId) {
    // تحديث موجود
    this.accountService.updateAccountGuide(this.editingId, this.newAccount).subscribe({
      next: (res) => {
        Swal.fire('تم التحديث', 'تم تعديل الحساب بنجاح!', 'success');
        this.closeModal();
        this.loadAccounts(); // إعادة تحميل البيانات بعد التحديث
      },
      error: (err) => Swal.fire('خطأ', 'فشل تعديل الحساب', 'error')
    });
  } else {
    // إنشاء جديد
    this.accountService.createAccountGuide(this.newAccount).subscribe({
      next: (res) => {
        Swal.fire('تم الإنشاء', 'تم إضافة الحساب بنجاح!', 'success');
        this.closeModal();
        this.loadAccounts(); // إعادة تحميل البيانات بعد الإضافة
      },
      error: (err) => Swal.fire('خطأ', 'فشل إنشاء الحساب', 'error')
    });
  }
}
onDragOver(event: DragEvent) {
  event.preventDefault();
}

onFileDropped(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer?.files.length) {
    this.selectedFile = event.dataTransfer.files[0];
  }
}

onFileSelected(event: any) {
  if (event.target.files.length) {
    this.selectedFile = event.target.files[0];
  }
}

removeFile() {
  this.selectedFile = null;
  this.uploadProgress = 0;
}

uploadFile() {
  if (!this.selectedFile) return;

  this.isUploading = true;
  this.uploadProgress = 0;

  this.accountService.importAccountGuides(this.selectedFile).subscribe({
    next: (event) => {
      if (event.type === HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round((100 * event.loaded) / event.total);
      } else if (event.type === HttpEventType.Response) {
        // انتهاء الرفع
        this.isUploading = false;
        Swal.fire('Success', 'تم رفع الملف بنجاح', 'success');
        this.closeImportModal();
        this.loadAccounts(); // تحديث البيانات بعد الرفع
      }
    },
    error: (err) => {
      this.isUploading = false;
      Swal.fire('Error', 'فشل رفع الملف', 'error');
    }
  });
}
openExportModal() {
  this.isExportModalOpen = true;
  console.log("trrrrrrrrrrue");

}

closeExportModal() {
  this.isExportModalOpen = false;
  this.selectedExportOption = null; // إعادة التعيين عند الغلق
}

selectExportOption(option: string) {
  this.selectedExportOption = option;
}
downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
handleExport() {
  if (!this.selectedExportOption) {
    Swal.fire('تنبيه', 'من فضلك اختر نوع الملف', 'info');
    return;
  }

  const selected = this.displayedAccounts.filter(a => a.selected);

  // لو في اختيار واحد
  if (selected.length === 1) {
    const id = selected[0].id;

    if (this.selectedExportOption === 'pdf') {
      this.accountService.exportSelectedPDF(id).subscribe(blob => {
        this.downloadFile(blob, `account_${id}.pdf`);
      });
    }

    if (this.selectedExportOption === 'excel') {
      this.accountService.exportSelectedExcel(id).subscribe(blob => {
        this.downloadFile(blob, `account_${id}.xlsx`);
      });
    }

    this.closeExportModal();
    return;
  }

  // لو مفيش اختيار → Export All
  if (this.selectedExportOption === 'pdf') {
    this.accountService.exportAllPDF().subscribe(blob => {
      this.downloadFile(blob, 'accounts.pdf');
    });
  }

  if (this.selectedExportOption === 'excel') {
    this.accountService.exportAllExcel().subscribe(blob => {
      this.downloadFile(blob, 'accounts.xlsx');
    });
  }

  this.closeExportModal();
}

}
