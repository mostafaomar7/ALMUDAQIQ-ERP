import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeretaryEngagementContractService } from '../secretary-engagement-contract/seretary-engagement-contract.service';
import { environment } from '../../../../../environment';
import { EngagemenDetails } from './engagemen-details.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;
@Component({
  selector: 'app-secretary-engagement-contract-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './secretary-engagement-contract-details.html',
  styleUrl: './secretary-engagement-contract-details.css'
})
export class SecretaryEngagementContractDetailsComponent implements OnInit {
  contractId: string | null = null;
  contract: any = null;
  loading = true;

  userRole: string = '';
  activeTab: string = 'contract';
  serverBaseUrl = environment.apiUrl;
  reviewComment: string = '';
  isSubmitting: boolean = false;

  reviewGuides: any[] = [];
  loadingGuides = false;

  pendingGuides: any[] = [];
  loadingPendingGuides = false;
searchQuery: string = '';
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractsApi: SeretaryEngagementContractService,
    private engagementService: EngagemenDetails,
      private lang : TranslateService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));

    this.getUserRoleFromStorage();

    this.contractId = this.route.snapshot.paramMap.get('id');
    this.worksheetId = this.contractId
    if (this.contractId) {
      this.fetchContractDetails(this.contractId);

      if (this.activeTab === 'review') {
        this.fetchReviewGuides();
      }

      if (this.activeTab === 'pending') {
        this.fetchPendingGuides();
      }
      if (this.activeTab === 'worksheet') {
        this.fetchAccountGuides();
        this.fetchWorksheetData();
      }
    }
      this.loadAuthorityLinksByCountry();
  }
    translations: typeof EN = EN;

 loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }
getStatusLabel(status: string | null | undefined): string {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'active') return this.t('active');
  if (normalized === 'inactive') return this.t('inactive');
  if (normalized === 'draft') return this.t('draft');
  if (normalized === 'pending') return this.t('pending');
  return status || this.t('active');
}

getStepperButtonLabel(): string {
  if (this.isSubmittingFinal) return this.t('processing');
  return this.isLastTab ? this.t('submit') : this.t('next');
}
  t(key: TranslationKey): string {
    return this.translations[key] || key;
  } 
  getUserRoleFromStorage() {
    try {
      const userString = localStorage.getItem('user');

      if (userString) {
        const userObject = JSON.parse(userString);
        this.userRole = userObject.role || '';
        console.log('✅ User Role Found:', this.userRole);
      } else {
        console.warn('⚠️ No user found in localStorage');
      }
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
    }
  }

  isSecretary(): boolean {
    return this.userRole?.toUpperCase() === 'SECRETARY';
  }

fetchContractDetails(id: string) {
  this.loading = true;
  this.contractsApi.getContractById(id).subscribe({
    next: (res) => {
      this.contract = res.data || res;
      this.editableContract = JSON.parse(JSON.stringify(this.contract));
      this.loading = false;
    },
    error: (err) => {
      console.error('Error fetching details:', err);
      this.loading = false;
    }
  });
}
enableEditMode() {
  this.isEditMode = true;
  this.editableContract = JSON.parse(JSON.stringify(this.contract));
}

cancelEditMode() {
  this.isEditMode = false;
  this.editableContract = JSON.parse(JSON.stringify(this.contract));
}

submitContractUpdates() {
  if (!this.contractId) return;

  const payload = {
    ...this.editableContract,
    status: 'ACTIVE' // أو أي status الباك إند مستنيه
  };

  this.isSubmittingUpdate = true;

  this.engagementService.updateContract(this.contractId, payload).subscribe({
    next: (res) => {
      this.contract = JSON.parse(JSON.stringify(payload));
      this.editableContract = JSON.parse(JSON.stringify(payload));
      this.isEditMode = false;
      this.isSubmittingUpdate = false;

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: res?.message || 'Contract updated successfully',
        confirmButtonColor: '#00875A'
      });
    },
    error: (err) => {
      this.isSubmittingUpdate = false;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.error?.message || 'Failed to update contract',
        confirmButtonColor: '#d33'
      });
    }
  });
}
saveEditOnly() {
  if (!this.contractId || !this.editableContract) return;

  this.isSavingEdit = true;

  const payload = {
    contractNumber: this.editableContract.contractNumber,
    legalEntity: this.editableContract.legalEntity,
    legalEntityType: this.editableContract.legalEntityType,
    articlesOfAssociation: this.editableContract.articlesOfAssociation,
    nationality: this.editableContract.nationality,
    customerName: this.editableContract.customerName,
    commercialRegisterNumber: this.editableContract.commercialRegisterNumber,
    taxNumber: this.editableContract.taxNumber,
    vatCertificate: this.editableContract.vatCertificate,
    unifiedNumber: this.editableContract.unifiedNumber,
    unifiedNumberCertificate: this.editableContract.unifiedNumberCertificate,
    commercialRegisterActivity: this.editableContract.commercialRegisterActivity,
    commercialRegisterDate: this.editableContract.commercialRegisterDate,
    commercialRegisterDateHijri: this.editableContract.commercialRegisterDateHijri,
    engagementContractDate: this.editableContract.engagementContractDate,
    postalCode: this.editableContract.postalCode,
    address: this.editableContract.address,
    email: this.editableContract.email,
    region: this.editableContract.region,
    contactPersonName: this.editableContract.contactPersonName,
    contactPhone: this.editableContract.contactPhone,
    whatsappPhone: this.editableContract.whatsappPhone,
    facilityLink: this.editableContract.facilityLink,
    facilityLogo: this.editableContract.facilityLogo,
    language: this.editableContract.language,
    currency: this.editableContract.currency,
    managerComments: this.editableContract.managerComments,
  };

  this.engagementService.updateContract(this.contractId, payload).subscribe({
    next: (res) => {
      this.contract = {
        ...this.contract,
        ...payload,
        status: res?.data?.status || this.contract.status
      };

      this.editableContract = { ...this.contract };
      this.isEditMode = false;
      this.isSavingEdit = false;

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: res?.message || 'Contract updated successfully',
        confirmButtonColor: '#00875A'
      });
    },
    error: (err) => {
      this.isSavingEdit = false;

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.error?.message || 'Failed to update contract',
        confirmButtonColor: '#d33'
      });
    }
  });
}
  getFileName(path: string | null): string {
    if (!path) return 'No File';
    return path.replace(/^.*[\\\/]/, '');
  }

  getFileUrl(path: string | null): string {
  if (!path) return '';

  // لو الباك إند رجع الرابط كـ http جاهز، رجعه زي ما هو
  if (path.startsWith('http')) return path;

  // البحث عن كلمة uploads في المسار
  const index = path.toLowerCase().indexOf('uploads');

  if (index !== -1) {
    // 1. قطع المسار من أول كلمة uploads
    let relativePath = path.substring(index);

    // 2. تحويل الـ Backslashes (\) إلى Slashes (/) عشان يتقري كـ URL في المتصفح
    relativePath = relativePath.replace(/\\/g, '/');

    // 3. تظبيط الـ Base URL
    let baseUrl = this.serverBaseUrl;

    // (اختياري) لو الـ apiUrl بتاعك بينتهي بـ /api، غالباً فولدر الـ uploads بيكون براه
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 4);
    }

    // التأكد من وجود سلاش في نهاية الـ baseUrl
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    // النتيجة النهائية هتكون مثلا: http://localhost:3000/uploads/contracts/document...pdf
    return baseUrl + relativePath;
  }

  return path;
}
  viewFile(path: string | null) {
    const url = this.getFileUrl(path);
    if (url) window.open(url, '_blank');
  }

  downloadFile(path: string | null) {
    const url = this.getFileUrl(path);
    const fileName = this.getFileName(path);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  returnToSecretariat() {
    if (!this.contractId) return;

    if (!this.reviewComment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Data',
        text: 'Please enter a comment before returning.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    this.isSubmitting = true;

    const newStatus = "ACTIVE";

    const payload = {
      status: newStatus,
      comments: this.reviewComment
    };

    this.engagementService.submitContractReview(this.contractId, payload).subscribe({
      next: (res) => {
        console.log('Success:', res);

        if (this.contract) {
          this.contract.status = newStatus;
        }

        const backendMessage = res?.message || 'Returned to Secretariat successfully';

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: backendMessage,
          confirmButtonColor: '#00875A'
        });

        this.isSubmitting = false;
        this.reviewComment = '';
      },
      error: (err) => {
        console.error('Error:', err);

        const errorMessage = err.error?.message || err.message || 'Failed to submit review';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#d33'
        });

        this.isSubmitting = false;
      }
    });
  }

get filteredReviewGuides() {
    if (!this.searchQuery) return this.reviewGuides;
    return this.reviewGuides.filter(item =>
      item.statement?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  fetchReviewGuides() {
    if (!this.contractId) return;

    this.loadingGuides = true;
    this.engagementService.getReviewGuides(this.contractId).subscribe({
      next: (res) => {
        console.log('Review guides response:', res);
        this.reviewGuides = Array.isArray(res?.data) ? res.data : [];
        this.loadingGuides = false;
      },
      error: (err) => {
        console.error('Error fetching review guides:', err);
        this.reviewGuides = [];
        this.loadingGuides = false;
      }
    });
  }

  fetchPendingGuides() {
    if (!this.contractId) return;

    this.loadingPendingGuides = true;
    this.engagementService.getPendingGuides(this.contractId).subscribe({
      next: (res) => {
        console.log('Pending guides response:', res);
        this.pendingGuides = Array.isArray(res?.data) ? res.data : [];
        this.loadingPendingGuides = false;
      },
      error: (err) => {
        console.error('Error fetching pending guides:', err);
        this.pendingGuides = [];
        this.loadingPendingGuides = false;
      }
    });
  }

  toggleApplicable(item: any, isApplicable: boolean) {
    if (!item.id || item.isUpdating) return;

    item.isUpdating = true;

    const payload = {
      isApplicable: isApplicable,
      conclusion: isApplicable ? "تم التحقق من المستند وهو سليم" : "غير قابل للتطبيق"
    };

    this.engagementService.updateReviewGuideStatus(item.id, payload).subscribe({
      next: (res) => {
        item.isApplicable = isApplicable;
        item.conclusion = payload.conclusion;
        item.isUpdating = false;

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم تحديث الحالة بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err) => {
        console.error('Error updating status:', err);
        item.isUpdating = false;

        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: err.error?.message || 'حدث خطأ أثناء تحديث الحالة',
          confirmButtonColor: '#d33'
        });
      }
    });
  }


  // --- دوال رفع والتعامل مع المرفقات الجديدة ---

  onFileSelected(event: any, guide: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadDocument(guide, file);
    }
    // تصفير الـ input حتى يمكن رفع نفس الملف مرة أخرى إذا لزم الأمر
    event.target.value = null;
  }

  triggerFileInput(guideId: string) {
    const fileInput = document.getElementById(`fileUpload-${guideId}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  uploadDocument(guide: any, file: File) {
    guide.isUploading = true;
    this.engagementService.uploadReviewGuideDocument(guide.id, file).subscribe({
      next: (res) => {
        guide.isUploading = false;
        // تحديث المرفقات الخاصة بهذا الـ guide (بناءً على شكل استجابة الباك اند لديك)
        // قد تحتاج إلى إعادة جلب الـ guides أو إضافة الملف الجديد للمصفوفة
        this.fetchReviewGuides();

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'File uploaded successfully',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err) => {
        guide.isUploading = false;
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: err.error?.message || 'Failed to upload the document',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // دالة للحصول على أول ملف مرفق كعينة (بافتراض أن الباك اند يرجع مصفوفة documents)
  getFirstDocument(guide: any) {
    return (guide.documents && guide.documents.length > 0) ? guide.documents[0] : null;
  }

// أضف المتغير ده مع باقي المتغيرات فوق
isSubmittingFinal: boolean = false;

// -------------- دوال الـ Stepper (Next, Back, Submit) --------------

// 1. مصفوفة الـ Tabs المتاحة بناءً على الـ Role
get availableTabs(): string[] {
    const tabs = ['contract', 'review', 'pending', 'docs'];

    if (this.userRole === 'AUDIT_MANAGER') {
      tabs.push('team');
    }
    if (this.userRole === 'TECHNICAL_AUDITOR') {
      tabs.push('Trial', 'worksheet', 'Financial'); // تمت إضافة worksheet هنا
    }

    return tabs;
  }
// 2. التحقق هل إحنا في أول Tab
get isFirstTab(): boolean {
  return this.availableTabs.indexOf(this.activeTab) === 0;
}

// 3. التحقق هل إحنا في آخر Tab
get isLastTab(): boolean {
  return this.availableTabs.indexOf(this.activeTab) === this.availableTabs.length - 1;
}

// 4. الرجوع للـ Tab السابقة
goBack() {
  const currentIndex = this.availableTabs.indexOf(this.activeTab);
  if (currentIndex > 0) {
    this.setActiveTab(this.availableTabs[currentIndex - 1]);
  }
}

// 5. الذهاب للـ Tab التالية، أو عمل Submit لو إحنا في آخر Tab
goNextOrSubmit() {
  if (this.isLastTab) {
    this.submitFinalReview();
  } else {
    const currentIndex = this.availableTabs.indexOf(this.activeTab);
    if (currentIndex < this.availableTabs.length - 1) {
      this.setActiveTab(this.availableTabs[currentIndex + 1]);
    }
  }
}

// 6. إرسال الداتا للـ API
submitFinalReview() {
  if (!this.contractId) return;

  Swal.fire({
    title: 'تأكيد الاعتماد',
    text: "هل أنت متأكد من الاعتماد وإرسال العقد للفحص الفني؟",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#00875A',
    cancelButtonColor: '#d33',
    confirmButtonText: 'نعم، اعتماد',
    cancelButtonText: 'إلغاء'
  }).then((result) => {
    if (result.isConfirmed) {
      this.isSubmittingFinal = true;

      const payload = {
        status: "INACTIVE",
        comments: "تم الاعتماد، جاهز للفحص الفني"
      };

      // ✨ التعديل هنا (تمت إضافة علامة !) ✨
      this.engagementService.submitContractReview(this.contractId!, payload).subscribe({
        next: (res) => {
          this.isSubmittingFinal = false;

          if (this.contract) {
            this.contract.status = payload.status;
          }

          Swal.fire({
            icon: 'success',
            title: 'تم بنجاح',
            text: 'تم الاعتماد بنجاح، جاهز للفحص الفني',
            confirmButtonColor: '#00875A'
          });
        },
        error: (err) => {
          this.isSubmittingFinal = false;
          console.error('Submit Error:', err);
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: err.error?.message || 'حدث خطأ أثناء الاعتماد',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  });
}
// أضف هذه المتغيرات مع باقي المتغيرات في الكلاس
eligibleStaff: any[] = [];
loadingStaff: boolean = false;

// ... (داخل الكلاس) ...


// --- دوال الـ Team Independence ---

fetchEligibleStaff() {
  if (!this.contractId) return;

  this.loadingStaff = true;
  this.engagementService.getEligibleStaff(this.contractId).subscribe({
    next: (res) => {
      // بناءً على الـ Response اللي بعته، الداتا جوة res.data
      this.eligibleStaff = res.data || [];

      // هنضيف خاصية (isSelected) محلياً عشان نتحكم في شكل الـ Checkbox في الـ UI
      this.eligibleStaff.forEach(staff => {
        // يمكنك هنا وضع شرط لو الباك إند بيرجع الموظف متعلم عليه مسبقاً
        // staff.isSelected = staff.isAssigned || false;
        staff.isSelected = false;
      });

      this.loadingStaff = false;
    },
    error: (err) => {
      console.error('Error fetching staff:', err);
      this.eligibleStaff = [];
      this.loadingStaff = false;
    }
  });
}

onStaffSelectionChange(staff: any) {
  if (!this.contractId) return;

  // عكس الحالة محلياً (عشان تظهر علامة الصح)
  staff.isSelected = !staff.isSelected;

  // لو المستخدم اختار الموظف (علم عليه صح)
  if (staff.isSelected) {
    const payload = {
      userId: staff.id,
      // ✨ التعديل هنا: استخدمنا Role.name بدل jobTitle ✨
      role: staff.Role.name
    };

    staff.isAssigning = true; // عشان ممكن نعطل الزرار أثناء التحميل

    this.engagementService.assignStaff(this.contractId, payload).subscribe({
      next: (res) => {
        staff.isAssigning = false;

        // رسالة نجاح صغيرة زي الـ Toast
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Staff assigned successfully',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err) => {
        staff.isAssigning = false;
        staff.isSelected = false; // نرجع العلامة لو حصل إيرور

        Swal.fire({
          icon: 'error',
          title: 'Assignment Failed',
          text: err.error?.message || 'Failed to assign staff',
          confirmButtonColor: '#d33'
        });
      }
    });
  } else {
    // لو حابب تعمل دالة لفك التعيين (Un-assign) مستقبلاً
    console.log(`User un-selected: ${staff.fullName}`);
  }
}
// Add these variables at the top of your class
  trialBalanceData: any[] = [];
  trialBalanceFileName: string = 'Trial_Balance.xlsx';
  loadingTrialBalance: boolean = false;
  isUploadingTrial: boolean = false;
  trialSearchQuery: string = '';

  // Update your existing setActiveTab method
  setActiveTab(tab: string) {
    this.activeTab = tab;

    if ((tab === 'review' || tab === 'docs') && this.contractId) {
       this.fetchReviewGuides();
    }
    if (tab === 'pending' && this.contractId) {
      this.fetchPendingGuides();
    }
    if (tab === 'team' && this.contractId) {
      this.fetchEligibleStaff();
    }
    if (tab === 'Trial' && this.contractId) {
      this.fetchTrialBalance();
    }
    if (tab === 'worksheet') {
      this.fetchAccountGuides(); // جلب قائمة الحسابات للـ Dropdown
      this.fetchWorksheetData(); // جلب الجدول
    }
  }
  // --- Trial Balance Logic ---

  get filteredTrialBalance() {
    if (!this.trialSearchQuery) return this.trialBalanceData;
    return this.trialBalanceData.filter(item =>
      item.accountName?.toLowerCase().includes(this.trialSearchQuery.toLowerCase()) ||
      item.accountCode?.toString().includes(this.trialSearchQuery)
    );
  }

 // أضف هذا المتغير مع باقي المتغيرات
  trialBalanceSummary: any = null;

  // تعديل دالة fetchTrialBalance
  fetchTrialBalance() {
    if (!this.contractId) return;
    this.loadingTrialBalance = true;

    this.engagementService.getTrialBalance(this.contractId).subscribe({
      next: (res) => {
        this.trialBalanceData = res.data || [];
        this.trialBalanceSummary = res.summary || null;

console.log(res);
        
        this.loadingTrialBalance = false;
      },
      error: (err) => {
        console.error('Error fetching trial balance:', err);
        this.loadingTrialBalance = false;
      }
    });
  }
  onTrialFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadTrialBalanceFile(file);
    }
    event.target.value = null; // Reset input
  }

  uploadTrialBalanceFile(file: File) {
    if (!this.contractId) return;

    this.isUploadingTrial = true;
    this.engagementService.uploadTrialBalance(this.contractId, file).subscribe({
      next: (res) => {
        this.isUploadingTrial = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'File uploaded successfully',
          showConfirmButton: false,
          timer: 1500
        });
        this.fetchTrialBalance(); // Refresh table data
      },
      error: (err) => {
        this.isUploadingTrial = false;
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: err.error?.message || 'Failed to upload Trial Balance',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  exportTrialBalance() {
    if (!this.contractId) return;

    Swal.fire({ title: 'Downloading...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

    this.engagementService.exportTrialBalance(this.contractId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.trialBalanceFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        Swal.close();
      },
      error: (err) => {
        console.error('Export error', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to export file' });
      }
    });
  }
  // --- Financial Statements Logic ---

  financialPdfFileName: string = 'Financial_Statements.pdf'; // اسم الملف الافتراضي

  handleFinancialPdf(action: 'view' | 'download') {
    if (!this.contractId) return;

    // إظهار رسالة تحميل
    Swal.fire({
      title: action === 'view' ? 'جاري فتح الملف...' : 'جاري تحميل الملف...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    this.engagementService.exportFinancialStatementPdf(this.contractId).subscribe({
      next: (blob) => {
        Swal.close();

        // إنشاء رابط مؤقت للملف (Object URL)
        const url = window.URL.createObjectURL(blob);

        if (action === 'view') {
          // فتح الـ PDF في نافذة/تبويبة جديدة للمعاينة
          window.open(url, '_blank');
        } else if (action === 'download') {
          // إنشاء عنصر <a> وهمي لتحميل الملف
          const link = document.createElement('a');
          link.href = url;
          link.download = this.financialPdfFileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // مسح الرابط المؤقت لتنظيف الذاكرة
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        }
      },
      error: (err) => {
        console.error('PDF Fetch Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: 'حدث خطأ أثناء جلب ملف الـ PDF'
        });
      }
    });
  }
  isEditMode: boolean = false;
isSavingEdit: boolean = false;
editableContract: any = {};
isSubmittingUpdate = false;

startEdit() {
  this.isEditMode = true;
  this.editableContract = { ...this.contract };
}

cancelEdit() {
  this.isEditMode = false;
  this.editableContract = { ...this.contract };
}
saveEditAndSendInactive() {
  if (!this.contractId) return;

  this.isSavingEdit = true;

  const updatePayload = {
    contractNumber: this.editableContract.contractNumber,
    customerName: this.editableContract.customerName,
    legalEntity: this.editableContract.legalEntity,
    legalEntityType: this.editableContract.legalEntityType,
    nationality: this.editableContract.nationality,
    commercialRegisterNumber: this.editableContract.commercialRegisterNumber,
    taxNumber: this.editableContract.taxNumber,
    unifiedNumber: this.editableContract.unifiedNumber,
    commercialRegisterDate: this.editableContract.commercialRegisterDate,
    engagementContractDate: this.editableContract.engagementContractDate,
    email: this.editableContract.email,
    postalCode: this.editableContract.postalCode,
    region: this.editableContract.region,
    address: this.editableContract.address,
    contactPersonName: this.editableContract.contactPersonName,
    contactPhone: this.editableContract.contactPhone,
    whatsappPhone: this.editableContract.whatsappPhone,
    facilityLink: this.editableContract.facilityLink,
    language: this.editableContract.language,
    currency: this.editableContract.currency
  };

  this.engagementService.updateContract(this.contractId, updatePayload).subscribe({
    next: (updateRes) => {
      const reviewPayload = {
        status: 'INACTIVE',
        comments: 'تم الاعتماد، جاهز للفحص الفني'
      };

      this.engagementService.submitContractReview(this.contractId!, reviewPayload).subscribe({
        next: (reviewRes) => {
          this.contract = { ...this.editableContract, status: 'INACTIVE' };
          this.isEditMode = false;
          this.isSavingEdit = false;

          Swal.fire({
            icon: 'success',
            title: 'تم الحفظ بنجاح',
            text: 'تم تعديل العقد وتحويل حالته إلى INACTIVE',
            confirmButtonColor: '#00875A'
          });
        },
        error: (err) => {
          this.isSavingEdit = false;
          Swal.fire({
            icon: 'error',
            title: 'خطأ',
            text: err.error?.message || 'تم التعديل لكن فشل تحديث الحالة',
            confirmButtonColor: '#d33'
          });
        }
      });
    },
    error: (err) => {
      this.isSavingEdit = false;
      Swal.fire({
        icon: 'error',
        title: 'خطأ',
        text: err.error?.message || 'فشل تعديل العقد',
        confirmButtonColor: '#d33'
      });
    }
  });
}
isTrialEditMode: boolean = false;
editingTrialRowId: string | null = null;
editableTrialRow: any = null;
isSavingTrialRow: boolean = false;
startTrialEdit() {
  this.isTrialEditMode = true;
}

cancelTrialEditMode() {
  this.isTrialEditMode = false;
  this.editingTrialRowId = null;
  this.editableTrialRow = null;
}

editTrialRow(row: any) {
  this.editingTrialRowId = row.id;
  this.editableTrialRow = { ...row };
}

cancelTrialRowEdit() {
  this.editingTrialRowId = null;
  this.editableTrialRow = null;
}
saveTrialRow() {
  if (!this.editableTrialRow?.id) return;

  this.isSavingTrialRow = true;

  const payload = {
    accountCode: this.editableTrialRow.accountCode,
    accountName: this.editableTrialRow.accountName,
    beginningDebit: this.editableTrialRow.beginningDebit,
    beginningCredit: this.editableTrialRow.beginningCredit,
    debitMovement: this.editableTrialRow.debitMovement,
    creditMovement: this.editableTrialRow.creditMovement,
    beginningDebitAdjustment: this.editableTrialRow.beginningDebitAdjustment,
    beginningCreditAdjustment: this.editableTrialRow.beginningCreditAdjustment,
    debitMovementAdjustment: this.editableTrialRow.debitMovementAdjustment,
    creditMovementAdjustment: this.editableTrialRow.creditMovementAdjustment,
    adjustedBeginningBalance: this.editableTrialRow.adjustedBeginningBalance,
    netMovement: this.editableTrialRow.netMovement,
    closingDebit: this.editableTrialRow.closingDebit,
    closingCredit: this.editableTrialRow.closingCredit,
    finalBalance: this.editableTrialRow.finalBalance,
    balanceType: this.editableTrialRow.balanceType
  };

  this.engagementService.updateTrialBalanceAccount(this.editableTrialRow.id, payload).subscribe({
    next: (res) => {
      const index = this.trialBalanceData.findIndex(
        item => item.id === this.editableTrialRow.id
      );

      if (index !== -1) {
        this.trialBalanceData[index] = { ...this.editableTrialRow };
      }

      this.isSavingTrialRow = false;
      this.editingTrialRowId = null;
      this.editableTrialRow = null;

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Row updated successfully',
        showConfirmButton: false,
        timer: 1500
      });

      this.fetchTrialBalance();
    },
    error: (err) => {
      this.isSavingTrialRow = false;

      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.error?.message || 'Failed to update row',
        confirmButtonColor: '#d33'
      });
    }
  });
}
authorityLinks = {
  cpa: '',
  tax: '',
  ministry: '',
};
loadAuthorityLinksByCountry(): void {
  const userRaw = localStorage.getItem('user');

  if (!userRaw) {
    this.authorityLinks = { cpa: '', tax: '', ministry: '' };
    return;
  }

  let user: any;

  try {
    user = JSON.parse(userRaw);
  } catch (error) {
    console.error('Invalid user in localStorage', error);
    this.authorityLinks = { cpa: '', tax: '', ministry: '' };
    return;
  }

  const countryName = user?.countryName?.trim();

  if (!countryName) {
    this.authorityLinks = { cpa: '', tax: '', ministry: '' };
    return;
  }

  this.engagementService.getCountries().subscribe({
    next: (countries) => {
      const selectedCountry = countries.find(
        (country) => country.name?.toLowerCase() === countryName.toLowerCase()
      );

      this.authorityLinks = {
        cpa: selectedCountry?.cpaWebsite || '',
        tax: selectedCountry?.taxWebsite || '',
        ministry: selectedCountry?.commerceWebsite || '',
      };
    },
    error: (err) => {
      console.error('Failed to load countries', err);
      this.authorityLinks = { cpa: '', tax: '', ministry: '' };
    }
  });
}
// أضف هذه المتغيرات مع باقي متغيرات الكلاس (في الجزء الخاص بالـ Trial Balance)
  showSortMenu: boolean = false;
  isSorting: boolean = false;
worksheetId: string | null = null;
// --- Worksheet Variables ---
  worksheetFilter: 'unassigned' | 'assigned' = 'unassigned';
  worksheetData: any[] = [];
  loadingWorksheet: boolean = false;
  
  accountGuides: any[] = [];
  filteredAccountGuides: any[] = [];
  guideSearchQuery: string = '';
  activeDropdownRowId: string | null = null; // لتتبع أي صف مفتوح فيه الـ Dropdown
  // دالة لتحديد أو إلغاء تحديد كل الصفوف
  toggleAllSelection(event: any) {
    const isChecked = event.target.checked;
    this.filteredTrialBalance.forEach(row => {
      row.selected = isChecked;
    });
  }

  // دالة لجلب الـ IDs الخاصة بالصفوف المحددة فقط
  getSelectedAccountIds(): string[] {
    return this.trialBalanceData
      .filter(row => row.selected)
      .map(row => row.id); // بافتراض أن row.id هو المعرف المطلوب للـ API
  }

  // دالة تنفيذ الترتيب
  sortSelectedAccounts(order: 'asc' | 'desc') {
    if (!this.worksheetId) return;
    const selectedIds = this.getSelectedAccountIds();

    if (selectedIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'تنبيه',
        text: 'يرجى تحديد صف واحد على الأقل للترتيب.',
        confirmButtonColor: '#f39c12'
      });
      return;
    }

    this.isSorting = true;
    const payload = {
      accountIds: selectedIds,
      sortOrder: order
    };

    this.engagementService.sortTrialBalanceAccounts(this.worksheetId, payload).subscribe({
      next: (res) => {
        this.isSorting = false;
        this.showSortMenu = false; // إخفاء القائمة بعد الاختيار
        
        // إعادة جلب البيانات بعد الترتيب لتحديث الجدول
        this.fetchTrialBalance(); 
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'تم ترتيب الحسابات بنجاح',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (err) => {
        this.isSorting = false;
        Swal.fire({
          icon: 'error',
          title: 'خطأ',
          text: err.error?.message || 'حدث خطأ أثناء محاولة الترتيب',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  // --- Worksheet Logic ---

  setWorksheetFilter(filter: 'unassigned' | 'assigned') {
  this.worksheetFilter = filter;
  
  if (this.worksheetId) {
    this.fetchWorksheetData();
  } else {
    // لو لسه مفيش worksheetId، ممكن تنادي fetchTrialBalance الأول أو تظهر رسالة
    console.warn("Worksheet ID not found yet.");
  }
}

  fetchWorksheetData() {
    if (!this.worksheetId) return;
    this.loadingWorksheet = true;
    this.activeDropdownRowId = null; // إغلاق أي قائمة مفتوحة

    const request = this.worksheetFilter === 'unassigned' 
      ? this.engagementService.getUnassignedWorksheet(this.worksheetId)
      : this.engagementService.getAssignedWorksheet(this.worksheetId);

    request.subscribe({
      next: (res) => {
        this.worksheetData = res.data || [];
        this.loadingWorksheet = false;
      },
      error: (err) => {
        console.error('Error fetching worksheet:', err);
        this.worksheetData = [];
        this.loadingWorksheet = false;
      }
    });
  }

  fetchAccountGuides() {
    this.engagementService.getAccountGuides().subscribe({
      next: (res) => {
        this.accountGuides = res.data || [];
        this.filteredAccountGuides = [...this.accountGuides];
      },
      error: (err) => console.error('Error fetching guides:', err)
    });
  }

  // دوال التحكم في الـ Dropdown والبحث
  toggleGuideDropdown(rowId: string) {
    if (this.activeDropdownRowId === rowId) {
      this.activeDropdownRowId = null; // إغلاق لو كان مفتوحاً
    } else {
      this.activeDropdownRowId = rowId;
      this.guideSearchQuery = ''; // تصفير البحث عند الفتح
      this.filteredAccountGuides = [...this.accountGuides];
    }
  }

  filterGuides() {
    if (!this.guideSearchQuery) {
      this.filteredAccountGuides = [...this.accountGuides];
    } else {
      const lowerQuery = this.guideSearchQuery.toLowerCase();
      this.filteredAccountGuides = this.accountGuides.filter(g => 
        g.accountName?.toLowerCase().includes(lowerQuery) ||
        g.accountNumber?.toString().includes(lowerQuery)
      );
    }
  }

  // إرسال الـ Assign
  assignGuideToRow(row: any, guide: any) {
    if (!this.worksheetId) return;
    const payload = {
      assignments: [
        {
          accountId: row.id,
          accountGuideId: guide.id
        }
      ]
    };

    // إغلاق القائمة مؤقتاً أثناء التحميل
    this.activeDropdownRowId = null;

    this.engagementService.assignAccountGuide(this.worksheetId, payload).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Account Assigned Successfully',
          showConfirmButton: false,
          timer: 1500
        });
        // إعادة تحميل الجدول لتحديث البيانات (الرو هيختفي من unassigned ويروح للـ assigned)
        this.fetchWorksheetData(); 
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Assignment Failed',
          text: err.error?.message || 'Something went wrong',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
  // أضف هذه الدالة مع دوال الـ Worksheet
  unassignGuideFromRow(row: any) {
    if (!row.id) return;

    // إغلاق القائمة المنسدلة فوراً
    this.activeDropdownRowId = null;

    this.engagementService.unassignAccountGuide(row.id).subscribe({
      next: (res) => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Unassigned Successfully',
          showConfirmButton: false,
          timer: 1500
        });
        
        // إعادة تحميل الجدول (الصف هيختفي من قائمة Assigned ويرجع لـ Unassigned)
        this.fetchWorksheetData();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Unassign Failed',
          text: err.error?.message || 'Failed to unassign account guide',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
