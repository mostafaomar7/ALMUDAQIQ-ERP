import { Component, OnInit, HostListener } from '@angular/core'; // تم إضافة HostListener
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { UserService } from './user.service';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
  rawData: any;
}

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriber-users.html',
  styleUrls: ['./subscriber-users.css'],
})
export class SubscriberUsers implements OnInit {
  translations: typeof EN = EN;

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  allUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  paginationInput = 1;
  searchTerm = '';

  isModalOpen: boolean = false;
  currentStep: number = 1;
  isSubmitting: boolean = false;

  isEditMode: boolean = false;
  editingUserId: number | null = null;
  activeDropdown: number | null = null;

  rolesList = [
    { id: 3, name: 'BRANCH_MANAGER' },
    { id: 4, name: 'SECRETARY' },
    { id: 5, name: 'AUDIT_MANAGER' },
    { id: 6, name: 'TECHNICAL_AUDITOR' }
  ];

  branchesList: any[] = [];

  newUser: any = {
    fullName: '', username: '', roleId: '', branchId: '',
    workEmail: '', workMobile: '', startDate: '', status: '',
    employeeId: '', preferredLanguage: '', timeZone: '',
    workLocation: '', emailSignature: '', emergencyContact: '',
    recoveryEmail: '', passwordPolicy: '', profilePhoto: null
  };

  assignedDevices: { name: string; serial: string }[] = [];
  selectedFileName: string = '';

  constructor(
    private lang: TranslateService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.fetchBranches();
    this.fetchUsers();
  }

  fetchBranches() {
    this.userService.getBranches().subscribe({
      next: (res: any) => { this.branchesList = res.data || []; },
      error: (err: any) => { console.error('Error fetching branches:', err); }
    });
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        const usersFromServer = res.data || res || [];
        this.allUsers = usersFromServer.map((user: any) => {
          return {
// داخل دالة map
id: user.id || user._id || user.userId,            fullName: user.fullName || 'N/A',
            email: user.email || 'N/A',
            role: user.Role?.name || user.jobTitle || 'N/A',
            branch: user.branch?.name || 'N/A',
            status: user.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive',
            selected: false,
            rawData: user
          };
        });
      },
      error: (err: any) => {
        console.error('Error fetching users:', err);
        Swal.fire({ icon: 'error', title: this.t('error') || 'خطأ', text: 'حدث خطأ أثناء جلب بيانات المستخدمين' });
      }
    });
  }

  // ---------------- Dropdown & Status Update ----------------

  // تم التعديل هنا لغلق القائمة عند الضغط في أي مكان بالشاشة
// 1. لا تستخدم event.stopPropagation() هنا
toggleDropdown(userId: number, event: Event) {
  this.activeDropdown = this.activeDropdown === userId ? null : userId;
}

// 2. مرر الـ $event وتحقق من مكان النقر
@HostListener('document:click', ['$event'])
clickOutside(event: Event) {
  const targetElement = event.target as HTMLElement;

  // إذا كان مكان النقر خارج حاوية الـ dropdown بالكامل، قم بإغلاق القائمة
  if (targetElement && !targetElement.closest('.dropdown-container')) {
    this.activeDropdown = null;
  }
}

  updateUserStatus(user: User, newStatus: string) {
    this.activeDropdown = null;
    if (user.status.toLowerCase() === newStatus.toLowerCase()) return;

    Swal.fire({ title: 'جاري التحديث...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const raw = user.rawData;
    const payload = { ...raw, status: newStatus };

    this.userService.updateUser(user.id, payload).subscribe({
      next: (res: any) => {
        Swal.fire({ icon: 'success', title: 'نجاح', text: 'تم تحديث الحالة بنجاح', confirmButtonColor: '#00796b' });
        this.fetchUsers();
      },
      error: (err: any) => {
        const errorMessage = err?.error?.message || err?.error?.error || 'حدث خطأ أثناء التحديث';
        Swal.fire({ icon: 'error', title: 'خطأ', text: errorMessage, confirmButtonColor: '#d33' });
      }
    });
  }

  // ---------------- Modal Controls (Add & Edit) ----------------

  openAddUserModal() {
    this.isEditMode = false;
    this.editingUserId = null;
    this.isModalOpen = true;
    this.currentStep = 1;
    this.resetForm();
  }

  openEditUserModal() {
    const selectedUsers = this.allUsers.filter(u => u.selected);

    if (selectedUsers.length !== 1) {
      Swal.fire({ icon: 'warning', title: 'تنبيه', text: 'يرجى تحديد مستخدم واحد فقط للتعديل', confirmButtonColor: '#f39c12' });
      return;
    }

    const userToEdit = selectedUsers[0];
    const raw = userToEdit.rawData;

    this.isEditMode = true;
    this.editingUserId = userToEdit.id;
    this.currentStep = 1;

    this.newUser = {
      fullName: raw.fullName || '',
      username: raw.suggestedUsername || raw.username || '',
      roleId: raw.roleId || '',
      branchId: raw.branchId || '',
      workEmail: raw.email || '',
      workMobile: raw.phone || '',
      startDate: raw.startDate ? raw.startDate.split('T')[0] : '',
      status: raw.status ? (raw.status.toLowerCase() === 'active' ? 'Active' : 'Inactive') : '',
      employeeId: raw.employeeId || '',
      preferredLanguage: raw.language || '',
      timeZone: raw.timeZone || '',
      workLocation: raw.workLocation || '',
      emailSignature: raw.emailSignature || '',
      emergencyContact: raw.emergencyContact || '',
      recoveryEmail: raw.recoveryEmail || '',
      passwordPolicy: raw.passwordPolicy || '',
      profilePhoto: null
    };

    if (raw.assignedDevices) {
      try {
        this.assignedDevices = typeof raw.assignedDevices === 'string' ? JSON.parse(raw.assignedDevices) : raw.assignedDevices;
      } catch (e) {
        this.assignedDevices = [];
      }
    } else {
      this.assignedDevices = [];
    }

    this.selectedFileName = raw.profilePhoto ? 'Current Photo (Click to change)' : '';
    this.isModalOpen = true;
  }

  submitNewUser() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      fullName: this.newUser.fullName || "",
      email: this.newUser.workEmail || "",
      phone: this.newUser.workMobile || null,
      status: this.newUser.status ? this.newUser.status.toLowerCase() : "active",
      mustChangePassword: true,
      roleId: Number(this.newUser.roleId),
      subscriberId: 7,
      branchId: Number(this.newUser.branchId),
      otp: null,
      otpExpiresAt: null,
      employeeId: this.newUser.employeeId || null,
      jobTitle: String(this.newUser.roleId) || "",
      startDate: this.newUser.startDate ? new Date(this.newUser.startDate).toISOString() : null,
      language: this.newUser.preferredLanguage || "",
      timeZone: this.newUser.timeZone || "",
      workLocation: this.newUser.workLocation || "",
      profilePhoto: null,
      emailSignature: this.newUser.emailSignature || "",
      emergencyContact: this.newUser.emergencyContact || "",
      assignedDevices: this.assignedDevices.length > 0 ? JSON.stringify(this.assignedDevices) : "",
      recoveryEmail: this.newUser.recoveryEmail || "",
      recoveryPhone: "",
      suggestedUsername: this.newUser.username || "",
      permissions: null
    };

    const apiCall = this.isEditMode && this.editingUserId
      ? this.userService.updateUser(this.editingUserId, payload)
      : this.userService.addUser(payload);

    apiCall.subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        const successMessage = response?.message || 'تمت العملية بنجاح';

        Swal.fire({
          icon: 'success',
          title: this.t('success') || 'نجاح',
          text: successMessage,
          confirmButtonColor: '#00796b',
          confirmButtonText: this.t('ok') || 'حسناً'
        }).then(() => {
          this.fetchUsers();
        });

        this.closeModal();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const errorMessage = err?.error?.message || err?.error?.error || 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';

        Swal.fire({
          icon: 'error',
          title: this.t('error') || 'خطأ',
          text: errorMessage,
          confirmButtonColor: '#d33',
          confirmButtonText: this.t('close') || 'إغلاق'
        });
      }
    });
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  nextStep() { if (this.currentStep < 3) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }

  addDevice() { this.assignedDevices.push({ name: '', serial: '' }); }
  removeDevice(index: number) { this.assignedDevices.splice(index, 1); }

  isStep1Valid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]+$/;
    const { fullName, username, roleId, branchId, workEmail, workMobile, startDate, status } = this.newUser;

    return !!(fullName && fullName.trim() !== '' && username && username.trim() !== '' && roleId && branchId &&
      workEmail && emailRegex.test(workEmail) && workMobile && phoneRegex.test(workMobile) && startDate && status);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({ icon: 'error', title: this.t('error') || 'خطأ', text: 'حجم الصورة يجب ألا يتجاوز 10 ميجابايت', confirmButtonColor: '#d33' });
        event.target.value = '';
        return;
      }
      this.selectedFileName = file.name;
      this.newUser.profilePhoto = file;
    }
  }

  resetForm() {
    this.newUser = {
      fullName: '', username: '', roleId: '', branchId: '', workEmail: '', workMobile: '', startDate: '', status: '',
      employeeId: '', preferredLanguage: '', timeZone: '', workLocation: '', emailSignature: '', emergencyContact: '',
      recoveryEmail: '', passwordPolicy: '', profilePhoto: null
    };
    this.assignedDevices = [];
    this.currentStep = 1;
    this.selectedFileName = '';
    this.isEditMode = false;
    this.editingUserId = null;
  }

  // ---------------- Pagination & Table Selection ----------------
  get displayedUsers(): User[] {
    const list = this.allUsers;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return list.slice(startIndex, endIndex);
  }

  get totalPages(): number { return Math.ceil(this.allUsers.length / this.itemsPerPage) || 1; }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) { if (i < total && i > 1) range.push(i); }
    if (total > 1 && range[range.length - 1] !== total) range.push(total);

    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  }

  changePage(page: number | string) {
    if (page === '...' || typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginationInput = page;
  }

  goToInputPage() { this.changePage(this.paginationInput); }

  get isAllSelected(): boolean { return this.displayedUsers.length > 0 && this.displayedUsers.every((u) => u.selected); }

  get isPartiallySelected(): boolean {
    const selectedCount = this.displayedUsers.filter((u) => u.selected).length;
    return selectedCount > 0 && selectedCount < this.displayedUsers.length;
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.displayedUsers.forEach((u) => (u.selected = isChecked));
  }

  toggleRow(user: User) { user.selected = !user.selected; }
  statusLabel(status: User['status']) { return status === 'Active' ? this.t('active') : this.t('inactive'); }
}
