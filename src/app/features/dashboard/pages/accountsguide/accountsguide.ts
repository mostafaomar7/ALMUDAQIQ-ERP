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

  // allAccounts: DisplayAccount[] = [];
// filteredAccounts: DisplayAccount[] = [];
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
  id: account.id || null,
  level: account.level || '',
  accountNumber: account.number ? Number(account.number) : '',
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
  this.currentPage = 1;
  this.loadAccounts(1);
}

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: keyof typeof EN | string): string {
  return (this.translations as any)[key] || key;
}
loadAccounts(page: number = 1) {
  this.accountService
    .getAccountGuides(page, this.itemsPerPage, this.searchText)
    .subscribe({
      next: (res: any) => {
        const list: AccountGuide[] = res?.data ?? [];

        this.displayedAccounts = list.map((a: AccountGuide) => ({
          id: a.id,
          name: a.accountName || '',
          level: a.level,
          number: (a.accountNumber ?? '').toString(),
          rules: a.rulesAndRegulations || '',
          notes: a.disclosureNotes || '',
          code: a.code1 || '',
          objectiveCode: a.objectiveCode || '',
          relatedObjectives: a.relatedObjectives || '',
          selected: false
        }));

        // ✅ خُد الـ pagination من السيرفر
        this.currentPage = res?.page ?? page;
        this.totalItems = res?.total ?? list.length;

        // ✅ مهم: وحّد الـ limit مع السيرفر (لأن السيرفر بيرجع 20)
        this.itemsPerPage = res?.limit ?? this.itemsPerPage;

        this.totalPages =
          res?.totalPages ?? Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));

        this.calculatePagination();
      },
      error: (err) => console.error(err)
    });
}
// updateDisplayedAccounts() {
//   const start = (this.currentPage - 1) * this.itemsPerPage;
//   const end = start + this.itemsPerPage;

//   this.displayedAccounts = this.filteredAccounts.slice(start, end);

//   this.totalItems = this.filteredAccounts.length;
//   this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

//   this.calculatePagination();
// }

get showingRangeText(): string {
  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  return `${start}-${end} ${this.t('showingRangeOf')} ${this.totalItems.toLocaleString()}`;
}

sortAsc = true;

// sortByLevel() {
//   this.sortAsc = !this.sortAsc;

//   this.allAccounts.sort((a, b) => {
//     return this.sortAsc
//       ? Number(a.level) - Number(b.level)
//       : Number(b.level) - Number(a.level);
//   });

//   this.updateDisplayedData();
// }
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
    if (!result.isConfirmed) return;

    const deleteRequests = selectedAccounts.map(acc =>
      this.accountService.deleteAccountGuide(acc.id)
    );

    // نفذ كل عمليات الحذف
    Promise.all(deleteRequests.map(req => req.toPromise()))
      .then(() => {
        // 👇 لو الصفحة فضيت بعد الحذف
        if (selectedAccounts.length === this.displayedAccounts.length) {
          if (this.currentPage > 1) {
            this.currentPage--;
          }
        }

        this.loadAccounts(this.currentPage);

        Swal.fire('Deleted!', 'Selected account(s) have been deleted.', 'success');
      })
      .catch(err => {
        console.error(err);
        Swal.fire('Error', 'Failed to delete some accounts', 'error');
      });
  });
}

  // updateDisplayedData() {
  //   const start = (this.currentPage - 1) * this.itemsPerPage;
  //   this.displayedAccounts = this.allAccounts.slice(start, start + this.itemsPerPage);
  // }
goToPage(page: number | string) {
  if (typeof page === 'string') return;

  if (page >= 1 && page <= this.totalPages) {
    this.loadAccounts(page);
  }
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.loadAccounts(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.loadAccounts(this.currentPage - 1);
  }
}

goToPageInput(e: any) {
  const p = parseInt(e.target.value);
  if (!isNaN(p) && p >= 1 && p <= this.totalPages) this.goToPage(p);
}

  calculatePagination() {
    const t = this.totalPages || 1;
const c = this.currentPage || 1;
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
  acc.selected = !acc.selected;

  const selected = this.displayedAccounts.filter(a => a.selected);

  if (selected.length === 1) {
    this.selectedAccount = selected[0];
  } else {
    // صفر أو أكتر من واحد → مفيش Edit
    this.selectedAccount = null;
  }
}


toggleAll() {
  const allSelected = this.displayedAccounts.every(a => a.selected);
  this.displayedAccounts.forEach(a => a.selected = !allSelected);
}


  nextStep() {
  const currentStepElement = document.querySelector(`.step-${this.currentStep}`);

  if (!currentStepElement) return;

  // نجيب كل الحقول في الخطوة الحالية فقط
  const fields = currentStepElement.querySelectorAll('input, textarea');

  let isValid = true;

  fields.forEach((field: any) => {
    field.classList.add('ng-touched'); // عشان الرسالة تظهر

    if (!field.value || field.value.trim() === '') {
      field.classList.add('shake');   // هزة بسيطة (اختياري)
      isValid = false;
    }
  });

  if (!isValid) return; // منع الانتقال

  // لو الخطوة سليمة → انتقل
  if (this.currentStep < 3) {
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
  this.selectedAccount = account;
  this.openAddModal(account);
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
    this.accountService.createAccountGuide(this.newAccount).subscribe({
  next: (res) => {
    Swal.fire('تم الإنشاء', 'تم إضافة الحساب بنجاح!', 'success');
    this.closeModal();
    this.loadAccounts();
  },
  error: (err) => {
    let message = 'فشل إنشاء الحساب';

    if (err?.error) {
      message =
        err.error.message ||
        err.error.error ||
        err.error ||
        message;
    }

    // اقفل المودال الأول (اختياري)
    this.closeModal();

    setTimeout(() => {
      Swal.fire({
        title: 'خطأ',
        text: message,
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    }, 0);
  }
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
  this.isUploading = false;

  const res = event.body; // <-- ده الريسبونس اللي انت باعته من الباك

  let message = `تم تنفيذ عملية الاستيراد بنجاح ✅<br>`;
  let icon: any = 'success';

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
    title: 'نتيجة الاستيراد',
    html: message,
    icon: icon,
    confirmButtonText: 'حسناً'
  });

  this.closeImportModal();
  this.loadAccounts();
}

    },
error: (err) => {
  this.isUploading = false;

  let message = 'حدث خطأ غير متوقع';

  if (err?.error) {
    message =
      err.error.error ||
      err.error.message ||
      message;
  }

  // 🔥 اقفل المودال الأول
  this.closeImportModal();

  // ⏱️ استنى frame صغير
  setTimeout(() => {
    Swal.fire({
      title: 'خطأ أثناء الاستيراد',
      text: message,
      icon: 'error',
      confirmButtonText: 'حسناً'
    });
  }, 0);
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
// 🆕 تحديث المستوى تلقائيًا بناءً على عدد الأرقام في رقم الحساب
updateLevelBasedOnAccountNumber() {
  const numStr = this.newAccount.accountNumber?.toString() || '';
  const len = numStr.length;

  if (len === 0) {
    this.newAccount.level = '';
  } else if (len === 1) {
    this.newAccount.level = 'مستوى أول';
  } else if (len === 2) {
    this.newAccount.level = 'مستوى ثاني';
  } else if (len === 3 || len === 4) {
    this.newAccount.level = 'مستوى ثالث';
  } else if (len > 4) {
    this.newAccount.level = 'مستوى رابع';
  }
}
onAccountNumberChange() {
  if (!this.newAccount.accountNumber) return;

  // نشيل أي حاجة غير أرقام
  this.newAccount.accountNumber =
    this.newAccount.accountNumber.replace(/\D/g, '');

  // نثبت الحد الأقصى 8
  if (this.newAccount.accountNumber.length > 8) {
    this.newAccount.accountNumber =
      this.newAccount.accountNumber.slice(0, 8);
  }

  // تحديث المستوى
  this.updateLevelBasedOnAccountNumber();
}

}
