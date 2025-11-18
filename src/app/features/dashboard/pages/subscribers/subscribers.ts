import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from '../home/i18n/en';
import { AR } from '../home/i18n/ar';
import { FormsModule } from '@angular/forms';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscribers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribers.html',
  styleUrls: ['./subscribers.css'],
})
export class Subscribers implements OnInit {

  translations: typeof EN = EN;
  currentLang: 'en' | 'ar';
Math = Math; // أضف هذا السطر داخل الكلاس Subscribers
activeTab: string = 'subscribers';
setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  subscribers: any[] = [];
  allSubscribers = [
    { name: 'Ahmed Ali', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' , selected: false},
    { name: 'Youssef Hassan', email: 'YoussefHassan@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' , selected: false},
    { name: 'Omar Khaled', email: 'OmarKhaled@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' , selected: false },
    { name: 'Mona Ibrahim', email: 'MonaIbrahim@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' , selected: false},
  ];

  // 👇 متغير للتحكم في ظهور المنيو
  showFilterModal: boolean = false;

  // دالة لفتح وإغلاق الفلتر
  toggleFilter() {
    this.showFilterModal = !this.showFilterModal;
  }

  // دالة لإغلاق الفلتر عند الضغط على الخلفية أو زر الإغلاق
  closeFilter() {
    this.showFilterModal = false;
  }

  // دالة تطبيق الفلتر (يمكنك إضافة المنطق لاحقاً)
  applyFilter() {
    console.log('Filters Applied');
    this.closeFilter();
  }

  resetFilter() {
    console.log('Filters Reset');
    // هنا كود تصفير الفلاتر
  }

  showAddUserModal: boolean = false;
  currentStep: number = 1;
  totalSteps: number = 5;

  openAddUserModal() {
    this.showAddUserModal = true;
    this.currentStep = 1; // البدء دائماً من الخطوة الأولى
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submissionStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  generatedLink: string = 'www.almudaqiq.khalil.com'; // الرابط الوهمي
  errorMessage: string = '';

  // تعديل دالة Submit لعمل محاكاة للنجاح والفشل
  submitNewUser() {
    this.submissionStatus = 'loading';

    // محاكاة اتصال بالسيرفر (تأخير 1.5 ثانية)
    setTimeout(() => {
      // يمكنك تغيير هذا الشرط لتجربة الخطأ (مثلاً اجعله false)
      const isSuccess = true;

      if (isSuccess) {
        this.submissionStatus = 'success';
        this.showAddUserModal = false; // إغلاق الويزارد عند النجاح
      } else {
        this.submissionStatus = 'error';
        this.errorMessage = 'Something went wrong, please try again.';
      }
    }, 1500);
  }

  // دالة زر "Add Another Subscriber"
  resetAndAddAnother() {
    this.submissionStatus = 'idle';
    this.currentStep = 1;
    this.showAddUserModal = true; // فتح الويزارد مرة أخرى
    // هنا يمكنك تصفير الفورم إذا كنت تستخدم ReactiveForms
  }

  // دالة زر "Go to Subscribers List"
  closeSuccessModal() {
    this.submissionStatus = 'idle';
    this.currentStep = 1;
    // هنا يمكنك عمل تحديث للجدول لجلب البيانات الجديدة
  }

  // دالة نسخ الرابط
  copyLink() {
    navigator.clipboard.writeText(this.generatedLink).then(() => {
      alert('Link copied to clipboard!');
    });
  }
showReminderModal: boolean = false;
  reminderOptions = {
    email: false,
    phone: false,
    system: false
  };

  openReminderModal() {
    this.showReminderModal = true;
  }

  closeReminderModal() {
    this.showReminderModal = false;
    // إعادة تعيين الخيارات إذا أردت
    this.reminderOptions = { email: false, phone: false, system: false };
  }

  confirmReminder() {
    console.log('Sending reminders via:', this.reminderOptions);
    // هنا كود الاتصال بالـ API لإرسال التنبيهات
    this.closeReminderModal();
  }
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 1250;
  goToPageInput: number | null = null;

  constructor(public translate: TranslateService) {
    this.currentLang = this.translate.currentLang;
    this.subscribers = this.allSubscribers.map(user => ({ ...user, selected: false }));
  }

  ngOnInit(): void {
    this.loadTranslations(this.currentLang);
    this.translate.lang$.subscribe(lang => {
      this.currentLang = lang;
      this.loadTranslations(lang);
    });
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  // --- Checkbox Logic ---
  toggleAllSelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.subscribers.forEach(user => user.selected = checked);
  }

  get allSelected(): boolean {
    return this.subscribers.every(user => user.selected);
  }

  get selectedUsers() {
    return this.subscribers.filter(u => u.selected);
  }

  updateSelectedUsers() {
  const selected = this.subscribers.filter(u => u.selected);
  console.log("Updating users: ", selected);
}

deleteSelectedUsers() {
  const selected = this.subscribers.filter(u => u.selected);
  this.subscribers = this.subscribers.filter(u => !u.selected);
  console.log("Deleted users: ", selected);
}


  // --- Pagination Logic ---
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

  changePage(page: number | string) {
    if (typeof page === 'string') return;
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToPage() {
    if (this.goToPageInput) {
      this.changePage(this.goToPageInput);
      this.goToPageInput = null;
    }
  }
}
