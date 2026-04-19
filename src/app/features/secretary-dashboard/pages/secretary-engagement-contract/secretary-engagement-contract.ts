import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, map, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
 
type TranslationKey = keyof typeof EN;
import {
  SeretaryEngagementContractService,
  ApiEngagementContract,
  EngagementContractsResponse,
} from './seretary-engagement-contract.service';
import Swal from 'sweetalert2';
import { Country } from 'country-state-city';
// --- تعديل Interface Contract ---
interface Contract extends ApiEngagementContract {
  selected: boolean;
  // View Model Specific Properties
  establishmentName: string;
  contractDate: string;
  crNumber: string;

  // Index signature
  [key: string]: any;
}

@Component({
  selector: 'app-secretary-engagement-contract',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './secretary-engagement-contract.html',
  styleUrl: './secretary-engagement-contract.css',
})
export class SecretaryEngagementContract implements OnInit, OnDestroy {
  searchTerm = '';
  jumpToPage = 1;

  contracts: Contract[] = [];
  loading = false;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  startItem = 0;
  endItem = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // --- Modal & Form Variables ---
  isModalOpen = false;
  isSubmitting = false;
  currentStep = 1;
  totalSteps = 4;

  // متغيرات وضع التعديل
  isEditMode = false;
  editingContractId: string | null = null;

  contractForm!: FormGroup;
  selectedFiles: { [key: string]: File } = {};
  userRole: string = '';
countriesList: any[] = [];
  constructor(
    private contractsApi: SeretaryEngagementContractService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService ,
      private lang : TranslateService
  ) {
    this.initForm();
  }
  translations: typeof EN = EN;
 loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
  ngOnInit() {
        this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    const user = this.auth.getUser();
    this.userRole = user?.role || '';
    this.loadContracts();

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.searchTerm = value;
        this.currentPage = 1;
        this.jumpToPage = 1;
        this.loadContracts(1);
      });
        this.loadAuthorityLinksByCountry();
  this.loadCountriesFromLibrary(); // 👈 دي المهمة
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Form Initialization ---
  initForm() {
    this.contractForm = this.fb.group({
      // Step 1
      contractNumber: [{ value: '0008', disabled: true }],
      legalEntity: ['', Validators.required],
      legalEntityType: ['', Validators.required],
      nationality: ['', Validators.required],
      customerName: ['', Validators.required],
      commercialRegisterNumber: ['', Validators.required],
      commercialRegisterDate: ['', Validators.required],
      taxNumber: ['', Validators.required],
      unifiedNumber: ['', Validators.required],
      engagementContractDate: ['', Validators.required],
      fiscalYearStart: ['', Validators.required],
      fiscalYearEnd: ['', Validators.required],
      // Files Step 1
      vatCertificate: [null],
      unifiedCertificate: [null],
      articlesOfAssociation: [null],
      commercialRegisterActivity: [null],

      // Step 2
      postalCode: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      region: ['', Validators.required],

      // Step 3
      contactPersonName: ['', Validators.required],
      contactPhone: ['', Validators.required],
      whatsappPhone: ['', Validators.required],

      // Step 4
      facilityLink: [''],
      facilityLogo: [null],
      language: [''],
      currency: ['']
    });
  }

  // --- Modal Actions ---

  // 1. فتح المودال للإضافة الجديدة
  onAdd() {
    this.isEditMode = false;
    this.editingContractId = null;
    this.selectedFiles = {};
    this.currentStep = 1;
    this.contractForm.reset({ contractNumber: '0008' }); // Reset form
    this.isModalOpen = true;
  }

  // 2. فتح المودال للتعديل
  onEdit() {
    const selectedRows = this.contracts.filter(c => c.selected);

    if (selectedRows.length === 0) {
      Swal.fire('تنبيه', 'يرجى اختيار عقد للتعديل', 'warning');
      return;
    }
    if (selectedRows.length > 1) {
      Swal.fire('تنبيه', 'يرجى اختيار عقد واحد فقط للتعديل', 'warning');
      return;
    }

    const contract = selectedRows[0];
    this.isEditMode = true;
    this.editingContractId = contract.id;
    this.currentStep = 1;
    this.selectedFiles = {}; // Clear new files

    // Helper to format date for input[type="date"] (YYYY-MM-DD)
    const formatDate = (dateStr: string | undefined) => {
      if (!dateStr) return '';
      return new Date(dateStr).toISOString().split('T')[0];
    };

    // Fill form with data
    this.contractForm.patchValue({
  contractNumber: contract.contractNumber,
  legalEntity: contract.legalEntity,
  legalEntityType: contract['legalEntityType'] || '',
  nationality: contract.nationality,
  customerName: contract.customerName,
  commercialRegisterNumber: contract.commercialRegisterNumber,
  commercialRegisterDate: formatDate(contract.commercialRegisterDate),
  taxNumber: contract.taxNumber,
  unifiedNumber: contract.unifiedNumber,
  engagementContractDate: formatDate(contract.engagementContractDate),

  fiscalYearStart: formatDate(contract['fiscalYearStart']),
  fiscalYearEnd: formatDate(contract['fiscalYearEnd']),

  postalCode: contract.postalCode,
  address: contract.address,
  email: contract.email,
  region: contract.region,

  contactPersonName: contract['contactPersonName'],
  contactPhone: contract['contactPhone'],
  whatsappPhone: contract['whatsappPhone'],

  facilityLink: contract['facilityLink'],
  language: contract['language'],
  currency: contract['currency']
});
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.editingContractId = null;
  }

  // --- Wizard Navigation ---
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    } else {
      this.submitContract();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // --- File Handling ---
  onFileSelect(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[fieldName] = file;
      this.contractForm.patchValue({ [fieldName]: file });
    }
  }

  getFileName(fieldName: string): string {
    return this.selectedFiles[fieldName]?.name || '';
  }

  // --- Submit Logic (Create or Update) ---
  submitContract() {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'بيانات غير مكتملة',
        text: 'يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح.',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValues = this.contractForm.getRawValue();

    // 1. Append Text Fields
    const fileKeys = ['vatCertificate', 'unifiedCertificate', 'articlesOfAssociation', 'commercialRegisterActivity', 'facilityLogo'];

    Object.keys(formValues).forEach(key => {
      if (!fileKeys.includes(key) && formValues[key] !== null && formValues[key] !== undefined) {
        formData.append(key, formValues[key]);
      }
    });

    // 2. Append IDs (Required by Backend)
    // formData.append('subscriberId', '1');
    // formData.append('branchId', '1');

    // 3. Append Files (Only if new files are selected)
    if (this.selectedFiles['vatCertificate']) formData.append('vatCertificate', this.selectedFiles['vatCertificate']);
    if (this.selectedFiles['unifiedCertificate']) formData.append('unifiedNumberCertificate', this.selectedFiles['unifiedCertificate']);
    if (this.selectedFiles['articlesOfAssociation']) formData.append('articlesOfAssociation', this.selectedFiles['articlesOfAssociation']);
    if (this.selectedFiles['commercialRegisterActivity']) formData.append('commercialRegisterActivity', this.selectedFiles['commercialRegisterActivity']);
    if (this.selectedFiles['facilityLogo']) formData.append('facilityLogo', this.selectedFiles['facilityLogo']);

    // 4. Determine Request Type (POST vs PUT)
    let request$;
    if (this.isEditMode && this.editingContractId) {
      request$ = this.contractsApi.updateContract(this.editingContractId, formData);
    } else {
      request$ = this.contractsApi.createContract(formData);
    }

    request$.subscribe({
      next: (res: any) => {
        console.log(this.isEditMode ? 'Updated' : 'Created', res);
        this.isSubmitting = false;
        this.closeModal();
        this.loadContracts();

        // --- Success Swal ---
        // نعرض رسالة الباك إند إذا كانت موجودة، أو رسالة افتراضية
        const backendMessage = res?.message || res?.data?.message || (this.isEditMode ? 'تم تعديل العقد بنجاح' : 'تم إضافة العقد بنجاح');

        Swal.fire({
          icon: 'success',
          title: 'نجاح',
          text: backendMessage,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#3085d6'
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.isSubmitting = false;

        // --- Error Swal ---
        // استخراج رسالة الخطأ من الباك إند
        const msg = err.error?.customMessage || err.error?.message || err.message || 'حدث خطأ غير متوقع';

        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: msg,
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // --- Table Logic ---
  loadContracts(page: number = this.currentPage) {
    this.loading = true;
    this.contractsApi.getContracts({ page, limit: this.pageSize, search: this.searchTerm.trim() })
      .pipe(
        map((res: EngagementContractsResponse) => {
          const mapped = res.data.map((c) => this.toVM(c));
          return { ...res, data: mapped };
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.contracts = res.data;
          this.totalItems = res.total;
          this.currentPage = res.page;
          this.pageSize = res.limit;
          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
          this.startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
          this.endItem = Math.min(this.totalItems, this.currentPage * this.pageSize);
        },
        error: (err) => {
          this.contracts = [];
          this.loading = false;

          // عرض خطأ في حالة فشل جلب البيانات (اختياري ولكن مفضل)
          const msg = err.error?.message || 'فشل في تحميل البيانات';
          Swal.fire({
            icon: 'error',
            title: 'خطأ في التحميل',
            text: msg,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        },
      });
  }

  // --- تعديل دالة toVM لملء الخصائص المضافة ---
  private toVM(c: ApiEngagementContract): Contract {
    return {
      ...c,
      establishmentName: c.customerName,
      contractDate: c.engagementContractDate,
      crNumber: c.commercialRegisterNumber,
      selected: false,
    };
  }

  toggleSelection(contract: Contract) { contract.selected = !contract.selected; }

  toggleAll() {
    const allSelected = this.contracts.length > 0 && this.contracts.every((c) => c.selected);
    this.contracts.forEach((c) => (c.selected = !allSelected));
  }

  onSearchInput(value: string) { this.searchSubject.next(value ?? ''); }
  nextPage() { if (this.currentPage < this.totalPages) this.loadContracts(this.currentPage + 1); }
  prevPage() { if (this.currentPage > 1) this.loadContracts(this.currentPage - 1); }
  changePage(page: number) { if (page !== this.currentPage && page >= 1 && page <= this.totalPages) { this.jumpToPage = page; this.loadContracts(page); } }
  goToPage() { const p = Math.min(Math.max(1, Number(this.jumpToPage || 1)), this.totalPages); this.jumpToPage = p; this.loadContracts(p); }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  navigateToDetails(contractId: string) {
    this.router.navigate([contractId], { relativeTo: this.route });
  }
 authorityLinks = {
  ministry: '',
  tax: '',
  cpa: '',
};
loadAuthorityLinksByCountry() {
  const userRaw = localStorage.getItem('user');

  if (!userRaw) {
    this.authorityLinks = { ministry: '', tax: '', cpa: '' };
    return;
  }

  let user: any;

  try {
    user = JSON.parse(userRaw);
  } catch (error) {
    console.error('Invalid user data in localStorage', error);
    this.authorityLinks = { ministry: '', tax: '', cpa: '' };
    return;
  }

  const countryName = user?.countryName?.trim();

  if (!countryName) {
    this.authorityLinks = { ministry: '', tax: '', cpa: '' };
    return;
  }

  this.contractsApi.getCountries().subscribe({
    next: (countries) => {
      const selectedCountry = countries.find(
        (country) => country.name?.toLowerCase() === countryName.toLowerCase()
      );

      this.authorityLinks = {
        ministry: selectedCountry?.commerceWebsite || '',
        tax: selectedCountry?.taxWebsite || '',
        cpa: selectedCountry?.cpaWebsite || '',
      };
    },
    error: (err) => {
      console.error('Failed to load countries', err);
      this.authorityLinks = { ministry: '', tax: '', cpa: '' };
    }
  });
}
 
loadCountriesFromLibrary() {
  this.countriesList = Country.getAllCountries();
}
getModalTitle(): string {
  return this.isEditMode ? this.t('editEngagementContract') : this.t('addEngagementContract');
}

getStepSubtitle(): string {
  switch (this.currentStep) {
    case 1: return this.t('basicData');
    case 2: return this.t('facilityAddress');
    case 3: return this.t('customerPortal');
    case 4: return this.t('technicalAllocation');
    default: return '';
  }
}

getNextButtonLabel(): string {
  if (this.currentStep === this.totalSteps) {
    if (this.isSubmitting) return this.t('saving');
    return this.isEditMode ? this.t('update') : this.t('submit');
  }
  return this.t('next');
}

getStatusLabel(status: string): string {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'active') return this.t('active');
  if (normalized === 'inactive') return this.t('inactive');
  if (normalized === 'archived') return this.t('archived');
  if (normalized === 'draft') return this.t('draft');
  if (normalized === 'pending') return this.t('pending');

  return status || '-';
}
}
