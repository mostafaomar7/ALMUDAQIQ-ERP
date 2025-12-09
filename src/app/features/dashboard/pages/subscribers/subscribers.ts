import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from '../home/i18n/en';
import { AR } from '../home/i18n/ar';
import { FormsModule } from '@angular/forms';
import { SubscriberService } from './subscriber.service';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environment';
import { HttpClient } from '@angular/common/http';

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
  commercialExpireDate : '' ,
  fiscalYear: '',
  unifiedNumber: '',
  // unifiedNumberFile: null,
  commercialActivityFile: null,
  subscriptionType: '',
  subscriptionStartDate: '',
  subscriptionEndDate: '',
  numberOfUsers: '',
  // numberOfClients: '',
  numberOfBranches: '',
  facilityLink: '',
  factoryLogo: null,
  language: '',
  currency: '',
  planId : '',
  planDate : '',
  fileLimit : '' ,
  maxFileSizeMB : ''
};

  translations: typeof EN = EN;
  currentLang: 'en' | 'ar';
Math = Math; // أضف هذا السطر داخل الكلاس Subscribers
activeTab: string = 'subscribers';
  renwalsubscribers: any[] = [];
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
// Subscribers Pagination
subCurrentPage: number = 1;
subItemsPerPage: number = 10;
subTotalItems: number = 0;

// Renewal Subscribers Pagination
renCurrentPage: number = 1;
renItemsPerPage: number = 10;
renTotalItems: number = 0;
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
validateStep(step: number): boolean {
  switch (step) {

    case 1:
      return this.formData.countryId &&
             this.formData.cityId
            //  this.formData.regionId
             ;

    case 2:
      return this.formData.licenseName &&
             this.formData.licenseNumber &&
             this.formData.licenseDate &&
             this.formData.licenseType;

    case 3:
      return this.formData.ownersNames &&
             this.formData.subscriberEmail &&
             this.formData.primaryMobile &&
             this.formData.legalEntityType &&
             this.formData.legalEntityNationality &&
             this.formData.taxNumber &&
             this.formData.commercialRegisterDate &&
             this.formData.fiscalYear &&
             this.formData.unifiedNumber &&
             this.formData.commercialRegisterNumber &&
             this.formData.commercialExpireDate;

    case 4:
      return this.formData.subscriptionType &&
            //  this.formData.subscriptionStartDate &&
            //  this.formData.subscriptionEndDate &&
             this.formData.numberOfUsers &&
            //  this.formData.numberOfClients &&
             this.formData.numberOfBranches;
             this.formData.fileLimit;
             this.formData.maxFileSizeMB;

    case 5:
      return true; // الخطوة 5 اختيارية

    default:
      return false;
  }
}

  nextStep() {
  if (!this.validateStep(this.currentStep)) {
    Swal.fire({
      icon: 'error',
      title: 'Missing information',
      text: 'Please complete all required fields before proceeding.',
      confirmButtonText: 'OK'
    });
    return;
  }

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
if (!this.validateStep(1) ||
    !this.validateStep(2) ||
    !this.validateStep(3) ||
    !this.validateStep(4)) {

  Swal.fire({
    icon: 'error',
    title: 'Required fields missing',
    text: 'Please complete all mandatory steps before submitting.',
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
// داخل الكلاس Subscribers
countryLinks: { name: string, url: string }[] = [];

// داخل كلاس Subscribers
onCountryChange() {
  const countryId = Number(this.formData.countryId);

  this.cities = [];
  this.regions = [];
  this.formData.cityId = '';
  this.formData.regionId = '';

  if (!countryId) return;

  const country = this.countries.find(c => c.id === countryId);
  if (!country) return;

  // تحميل المدن
  this.cities = country.cities || [];

  // الجنسية تلقائيًا
  this.formData.legalEntityNationality = country.name;

  // تعيين العملة تلقائيًا من ملف JSON
  const currencyObj = this.currencies.find(c => c.id === countryId);
  this.formData.currency = currencyObj ? currencyObj.currency : '';

  // روابط الدولة
  this.countryLinks = [
    { name: 'CPA', url: country.cpaWebsite },
    { name: 'Commerce Ministry', url: country.commerceWebsite },
    { name: 'Tax/Zakat Authority', url: country.taxWebsite }
  ];
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

  constructor(public translate: TranslateService ,private http: HttpClient ,   private subscriberService: SubscriberService
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
// this.loadRenwalSubscribers();
this.loadRenewalSubscribers();
  this.loadPlans();
    this.loadCountriesCurrency();
  }
  currencies: any[] = [];
loadCountriesCurrency() {
  this.http.get<any[]>('assets/data/countries-currency.json').subscribe({
    next: (data) => this.currencies = data,
    error: (err) => console.error('Error loading countries-currency.json', err)
  });
}
  plans: any[] = [];
selectedPlan: any = null; // لتخزين الخطة المختارة

loadPlans() {
  this.subscriberService.getPlans().subscribe({
    next: (res: any) => {
      this.plans = res;
    },
    error: (err) => {
      console.error('Error loading plans:', err);
    }
  });
}
onPlanChange(event: Event) {
  const selectedId = Number((event.target as HTMLSelectElement).value);
  const plan = this.plans.find(p => p.id === selectedId);
  if (!plan) return;

  this.selectedPlan = plan;
  this.formData.subscriptionType = plan.name; // أو plan.id لو عايز تخزن id
  this.formData.numberOfUsers = plan.usersLimit;
  // this.formData.numberOfClients = plan.clientsLimit;
  this.formData.numberOfBranches = plan.branchesLimit;
  this.formData.fileLimit = plan.fileLimit;
  this.formData.maxFileSizeMB = plan.maxFileSizeMB;
}

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
loadSubscribers() {
  const { countryId, cityId, regionId, status, newSubscribersDays, endingSubscriptionDays } = this.filterData;

  this.subscriberService
    .getSubscribers(
      this.subCurrentPage,
      this.subItemsPerPage,
      this.searchTerm, // لو عندك سيرش عالمي
      {
        countryId,
        cityId,
        regionId,
        status,
        newSubscribersDays,
        endingSubscriptionDays
      }
    )
    .subscribe({
      next: (res) => {
        this.subscribers = res.data;
        this.subTotalItems = res.total || res.data.length;
      },
      error: (err) => {
        console.error('Error loading subscribers:', err);
      }
    });
}

loadRenwalSubscribers() {
  this.subscriberService
    .getRenwalSubscribers(this.renCurrentPage, this.renItemsPerPage, this.searchTerm)
    .subscribe({
      next: (res) => {
        this.renwalsubscribers = res.data;
        this.renTotalItems = res.total;
      }
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
    // unifiedNumberFile: null,
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
  const pages: (number | string)[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return pages;
}
get subTotalPages(): number {
  return Math.ceil(this.subTotalItems / this.subItemsPerPage);
}

get renTotalPages(): number {
  return Math.ceil(this.renTotalItems / this.renItemsPerPage) || 1;
}
// للمشتركين
get subPaginationArray(): (number | string)[] {
  const total = this.subTotalPages; // أو حسب متغيرك الصحيح
  const current = this.subCurrentPage;
  return this.buildPaginationArray(total, current);
}

// للتجديد
get renPaginationArray(): (number | string)[] {
  const total = this.renTotalPages;
  const current = this.renCurrentPage;
  const pages: (number | string)[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return pages;
}
// دالة مساعدة لبناء مصفوفة الصفحات
private buildPaginationArray(total: number, current: number): (number | string)[] {
  const pages: (number | string)[] = [];
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
}
applyRenewalPagination() {
  const start = (this.renCurrentPage - 1) * this.renItemsPerPage;
  const end = start + this.renItemsPerPage;

  this.renDisplayedItems = this.renwalsubscribers.slice(start, end);
}

renDisplayedItems: any[] = []; // البيانات المعروضة فقط في الجدول

// عند تحميل البيانات من API
loadRenewalSubscribers() {
  this.subscriberService.getRenwalSubscribers(this.renCurrentPage, this.renItemsPerPage, this.searchTerm).subscribe((res: any) => {
    this.renwalsubscribers = res.data;
    this.renTotalItems = this.renwalsubscribers.length;

    this.applyRenewalPagination();
  });
}
changePage(type: 'sub' | 'ren', page: number) {

  if (type === 'sub') {
    if (page < 1 || page > this.subTotalPages) return;

    this.subCurrentPage = page;
    this.loadSubscribers();  // تحميل الصفحة الجديدة
    return;
  }

  if (type === 'ren') {
    if (page < 1 || page > this.renTotalPages) return;

    this.renCurrentPage = page;
    this.applyRenewalPagination();
  }
}

goToPage(table: 'sub' | 'ren') {
  if (this.goToPageInput) {
    this.changePage(table, this.goToPageInput);
    this.goToPageInput = null;
  }
}
selectedSubscriber: any = null;
showSubscriberOverlay: boolean = false;

openSubscriberOverlay(user: any) {
  this.selectedSubscriber = user;
  this.showSubscriberOverlay = true;
}

closeSubscriberOverlay() {
  this.showSubscriberOverlay = false;
  this.selectedSubscriber = null;
}
api_url = environment.apiUrl;
autoUpdateStatus(newStatus: string) {
  if (!newStatus) return;

  const selected = this.subscribers.filter(u => u.selected);

  if (selected.length !== 1) return;

  const sub = selected[0];

  this.subscriberService.updateSubscriberStatus(sub.id, newStatus)
    .subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Status Updated Automatically!',
          confirmButtonText: 'OK'
        });

        this.loadSubscribers(); // تحديث الجدول
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Something went wrong'
        });
      }
    });
}
isExportModalOpen = false;
selectedExportOption: 'excel' | 'pdf' | null = null;
openExportModal() {
  this.isExportModalOpen = true;
}

closeExportModal() {
  this.isExportModalOpen = false;
  this.selectedExportOption = null;
}

selectExportOption(option: 'excel' | 'pdf') {
  this.selectedExportOption = option;
}

handleExport() {
  if (!this.selectedExportOption) {
    alert('Please select file type.');
    return;
  }

  if (this.selectedExportOption === 'excel') {
    this.exportToExcel();
  }

  if (this.selectedExportOption === 'pdf') {
    this.exportToPDF();
  }

  this.closeExportModal();
}

exportToExcel() {
  this.subscriberService.exportExcel().subscribe({
    next: (file: Blob) => {
      const blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.xlsx';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Excel export error:', err);
      alert('Failed to export Excel file.');
    }
  });
}
exportToPDF() {
  this.subscriberService.exportPDF().subscribe({
    next: (file: Blob) => {
      const blob = new Blob([file], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'subscribers.pdf';
      a.click();

      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('PDF export error:', err);
      alert('Failed to export PDF file.');
    }
  });
}


}
