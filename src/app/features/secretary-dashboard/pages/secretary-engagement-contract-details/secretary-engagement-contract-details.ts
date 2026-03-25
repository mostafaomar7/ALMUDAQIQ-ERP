import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeretaryEngagementContractService } from '../secretary-engagement-contract/seretary-engagement-contract.service';
import { environment } from '../../../../../environment';
import { EngagemenDetails } from './engagemen-details.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

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
  ) {}

  ngOnInit() {
    this.getUserRoleFromStorage();

    this.contractId = this.route.snapshot.paramMap.get('id');
    if (this.contractId) {
      this.fetchContractDetails(this.contractId);

      if (this.activeTab === 'review') {
        this.fetchReviewGuides();
      }

      if (this.activeTab === 'pending') {
        this.fetchPendingGuides();
      }
    }
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching details:', err);
        this.loading = false;
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
    tabs.push('Trial', 'Financial');
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
    // 👇 Add this condition
    if (tab === 'Trial' && this.contractId) {
      this.fetchTrialBalance();
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
        // قراءة المصفوفة والإجماليات من الـ Response
        this.trialBalanceData = res.data || [];
        this.trialBalanceSummary = res.summary || null;

        // إذا كان هناك اسم ملف راجع من الـ API يمكن تعيينه هنا
        // this.trialBalanceFileName = res.fileName || 'VAT_Certificate_2024.xlsx';

        this.loadingTrialBalance = false;
      },
      error: (err) => {
        console.error('Error fetching trial balance:', err);
        this.trialBalanceData = [];
        this.trialBalanceSummary = null;
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
}
