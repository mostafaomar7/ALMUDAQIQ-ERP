import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from '../home/i18n/en';
import { AR } from '../home/i18n/ar';
import { FormsModule } from '@angular/forms';
import { SubscriberService } from './subscriber.service';
import Swal from 'sweetalert2';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscribers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscribers.html',
  styleUrls: ['./subscribers.css'],
})
export class Subscribers implements OnInit {
formData: any = {
  countryId: '',
  cityId: '',
  regionId: '',
  licenseName: '',
  licenseNumber: '',
  licenseDate: '',
  licenseType: '',
  licenseCertificate: null,
  ownersNames: '',
  subscriberEmail: '',
  primaryMobile: '',
  // status: '',
  legalEntityType: '',
  legalEntityNationality: '',
  taxNumber: '',
  taxCertificateFile: null,
  commercialRegisterDate: '',
  commercialRegisterNumber : '' ,
  fiscalYear: '',
  unifiedNumber: '',
  unifiedNumberFile: null,
  commercialActivityFile: null,
  subscriptionType: '',
  subscriptionStartDate: '',
  subscriptionEndDate: '',
  numberOfUsers: '',
  numberOfClients: '',
  numberOfBranches: '',
  facilityLink: '',
  factoryLogo: null,
  language: '',
  currency: 'SAR'
};

  translations: typeof EN = EN;
  currentLang: 'en' | 'ar';
Math = Math; // أضف هذا السطر داخل الكلاس Subscribers
activeTab: string = 'subscribers';
setActiveTab(tab: string) {
    this.activeTab = tab;
  }
countries: any[] = [];
cities: any[] = [];
regions: any[] = [];

  subscribers: any[] = [];
isEditMode: boolean = false;
editingSubscriberId: number | null = null;
selectedSubscriberStatus: string = '';

  // 👇 متغير للتحكم في ظهور المنيو
  showFilterModal: boolean = false;
searchTerm: string = '';
filterData = {
  countryId: '',
  cityId: '',
  regionId: '',
  status: '',
  newSubscribersDays: '',
  endingSubscriptionDays: ''
};
onFilterCountryChange() {
  const id = Number(this.filterData.countryId); // <-- تحويل هنا
  this.filterData.cityId = '';
  this.filterData.regionId = '';
  this.cities = [];
  this.regions = [];

  if (!id) return;

  this.subscriberService.getCitiesByCountry(id).subscribe({
    next: res => this.cities = res
  });
}

onFilterCityChange() {
  const id = Number(this.filterData.cityId);  // <-- تحويل هنا
  this.filterData.regionId = '';
  this.regions = [];

  if (!id) return;

  this.subscriberService.getRegionsByCity(id).subscribe({
    next: res => this.regions = res
  });
}

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
  console.log("Filters Applied:", this.filterData);

  this.currentPage = 1;
  this.loadSubscribers();
  this.closeFilter();
}
resetFilter() {
  this.filterData = {
    countryId: '',
    cityId: '',
    regionId: '',
    status: '',
    newSubscribersDays: '',
    endingSubscriptionDays: ''
  };

  this.cities = [];
  this.regions = [];

  this.loadSubscribers();
}

onFileSelect(event: any, field: string) {
  const file = event.target.files[0];
  if (file) {
    this.formData[field] = file;
  }
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
submitNewUser() {
  // ✅ التحقق من اختيار الدولة والمدينة قبل الإرسال
  if (!this.formData.countryId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a country before submitting.',
      confirmButtonText: 'OK'
    });
    return;
  }

  if (!this.formData.cityId) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a city before submitting.',
      confirmButtonText: 'OK'
    });
    return;
  }

  this.submissionStatus = 'loading';

  const fd = new FormData();
  for (const key in this.formData) {
    if (this.formData[key] !== null && this.formData[key] !== undefined) {
      fd.append(key, this.formData[key]);
    }
  }

  let request$;

  if (this.isEditMode && this.editingSubscriberId) {
    // UPDATE
    request$ = this.subscriberService.updateSubscriber(this.editingSubscriberId, fd);
  } else {
    // CREATE
    request$ = this.subscriberService.createSubscriber(fd);
  }

  request$.subscribe({
    next: (res) => {
      this.submissionStatus = 'success';
      this.generatedLink = res.data.subdomain;
      this.showAddUserModal = false;

      Swal.fire({
        icon: 'success',
        title: this.isEditMode ? 'Subscriber Updated!' : 'Subscriber Added!',
        text: `Subscriber link: ${this.generatedLink}`,
        confirmButtonText: 'OK'
      });

      this.isEditMode = false;
      this.editingSubscriberId = null;

      this.loadSubscribers();
    },
    error: (err) => {
      this.submissionStatus = 'error';
      this.errorMessage = err.error?.message || 'Something went wrong';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: this.errorMessage,
        confirmButtonText: 'OK'
      });

      console.error('Error:', err);
    }
  });
}

loadCountries() {
  this.subscriberService.getCountries().subscribe({
    next: (res) => {
      this.countries = res;
    }
  });
}
onCountryChange() {
  const countryId = this.formData.countryId;

  this.cities = [];
  this.regions = [];
  this.formData.cityId = '';
  this.formData.regionId = '';

  if (!countryId) return;

  this.subscriberService.getCitiesByCountry(countryId).subscribe({
    next: (res) => {
      this.cities = res;
    }
  });
}

onCityChange() {
  const cityId = this.formData.cityId;

  this.regions = [];
  this.formData.regionId = '';

  if (!cityId) return;

  this.subscriberService.getRegionsByCity(cityId).subscribe({
    next: (res) => {
      this.regions = res;
    }
  });
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

  constructor(public translate: TranslateService ,   private subscriberService: SubscriberService
) {
    this.currentLang = this.translate.currentLang;
  }

  ngOnInit(): void {
    this.loadTranslations(this.currentLang);
    this.translate.lang$.subscribe(lang => {
      this.currentLang = lang;
      this.loadTranslations(lang);
    });
    this.loadSubscribers();
    this.loadCountries();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
loadSubscribers() {
  this.subscriberService
    .getSubscribers(this.currentPage, this.itemsPerPage, this.searchTerm, this.filterData)
    .subscribe({
      next: (res) => {
        this.subscribers = res.data;
        this.totalItems = res.total;
      },
      error: (err) => console.error("Error:", err)
    });
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

  if (selected.length !== 1) {
    alert('Please select exactly one subscriber to edit.');
    return;
  }

  const sub = selected[0];

  // تمرير البيانات للفورم
  this.formData = {
    ...sub,
    licenseCertificate: null,
    taxCertificateFile: null,
    unifiedNumberFile: null,
    commercialActivityFile: null,
    factoryLogo: null
  };

  this.editingSubscriberId = sub.id;

  // فتح الفورم
  this.showAddUserModal = true;
  this.currentStep = 1;
}
updateSubscriber() {
  if (!this.editingSubscriberId) return;

  const fd = new FormData();
  for (const key in this.formData) {
    if (this.formData[key] !== null && this.formData[key] !== undefined) {
      fd.append(key, this.formData[key]);
    }
  }

  this.subscriberService.updateSubscriber(this.editingSubscriberId, fd).subscribe({
    next: (res) => {
      this.showAddUserModal = false;
      Swal.fire({
        icon: 'success',
        title: 'Subscriber Updated!',
        confirmButtonText: 'OK'
      });
      this.isEditMode = false;
      this.editingSubscriberId = null;
      this.loadSubscribers();
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.error?.message || 'Something went wrong',
        confirmButtonText: 'OK'
      });
      console.error('Error updating subscriber:', err);
    }
  });
}
updateSubscriberStatus() {
  const selected = this.subscribers.filter(u => u.selected);

  if (selected.length !== 1) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select exactly one subscriber to update status.',
      confirmButtonText: 'OK'
    });
    return;
  }

  const sub = selected[0];

  if (!this.selectedSubscriberStatus) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Please select a status before updating.',
      confirmButtonText: 'OK'
    });
    return;
  }

  this.subscriberService.updateSubscriberStatus(sub.id, this.selectedSubscriberStatus)
    .subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          confirmButtonText: 'OK'
        });
        this.loadSubscribers(); // إعادة تحميل الجدول
        this.selectedSubscriberStatus = '';
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Something went wrong',
          confirmButtonText: 'OK'
        });
      }
    });
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
    this.loadSubscribers();   // 👈 إعادة تحميل البيانات
  }
}

goToPage() {
  if (this.goToPageInput) {
    this.changePage(this.goToPageInput);
    this.goToPageInput = null;
  }
}

}
