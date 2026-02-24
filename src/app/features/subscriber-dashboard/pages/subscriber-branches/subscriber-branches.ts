import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { BranchService } from './branch.service';
import Swal from 'sweetalert2';

import { Country, City , State } from 'country-state-city';

interface BranchManager {
  fullName: string;
  email?: string;
  phone?: string;
  startDate?: string;
}

interface Branch {
  id: number;
  name: string;
  city: string;
  status: 'Active' | 'Inactive';
  manager: BranchManager | null;
  selected: boolean;
}

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-branches',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './subscriber-branches.html',
  styleUrls: ['./subscriber-branches.css'],
})
export class SubscriberBranches implements OnInit {
  translations: typeof EN = EN;

  allBranches: Branch[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  paginationInput = 1;
  searchTerm = '';

  showModal = false;
  currentStep = 1;
  branchForm!: FormGroup;

  isSubmitting = false;
  isLoading = false;

  // ===== Cities from country-state-city =====
  isCitiesLoading = false;
  cities: { name: string }[] = [];
  subscriberCountryName: string | null = null;
  subscriberCountryIso: string | null = null;
   isStatesLoading = false;
     states: { name: string; isoCode: string }[] = [];

  // menu/status
  openMenuBranchId: number | null = null;
  isUpdatingStatus = false;

  // add/edit
  mode: 'add' | 'edit' = 'add';
  editingBranch: Branch | null = null;

  constructor(
    private lang: TranslateService,
    private fb: FormBuilder,
    private branchService: BranchService
  ) {}

  ngOnInit() {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.initForm();
    this.fetchBranches();
    this.loadCitiesFromLibrary();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  // ===== form =====
  initForm() {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],

      // ✅ بدل cityId
      cityName: [null, Validators.required],

      managerName: ['', Validators.required],
      managerEmail: ['', [Validators.required, Validators.email]],
      managerPhone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      startDate: ['', Validators.required],
    });
  }

  private ctrl(name: string): AbstractControl | null {
    return this.branchForm.get(name);
  }

  isInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return !!c && c.touched && c.invalid;
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    if (input.value !== digitsOnly) input.value = digitsOnly;
    this.branchForm.get('managerPhone')?.setValue(digitsOnly, { emitEvent: false });
  }

  private extractBackendErrorMessage(err: any): string {
    const e = err?.error;
    if (!e) return err?.message || 'Something went wrong';
    if (typeof e === 'string') return e;
    if (typeof e?.message === 'string') return e.message;
    if (typeof e?.error === 'string') return e.error;

    if (Array.isArray(e?.errors) && e.errors.length) return String(e.errors[0]);

    if (e?.errors && typeof e.errors === 'object') {
      const firstKey = Object.keys(e.errors)[0];
      const val = e.errors[firstKey];
      if (Array.isArray(val) && val.length) return String(val[0]);
      if (typeof val === 'string') return val;
    }

    return 'Request failed';
  }

  // ===== localStorage country =====
  private readCountryNameFromLocalStorage(): string | null {
    const raw = localStorage.getItem('country');
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed?.name) return String(parsed.name).trim();
      if (parsed?.countryName) return String(parsed.countryName).trim();
      return raw.trim();
    } catch {
      return raw.trim();
    }
  }
  loadStatesFromLibrary() {
    this.isStatesLoading = true;

    const countryName = this.readCountryNameFromLocalStorage();
    this.subscriberCountryName = countryName;

    if (!countryName) {
      this.states = [];
      this.isStatesLoading = false;
      return;
    }

    const all = Country.getAllCountries();
    const countryObj =
      all.find((c: any) => this.normalize(c.name) === this.normalize(countryName)) ||
      all.find((c: any) => this.normalize(c.name).includes(this.normalize(countryName)));

    if (!countryObj?.isoCode) {
      this.states = [];
      this.isStatesLoading = false;

      Swal.fire({
        icon: 'error',
        title: 'Country not found',
        text: `Cannot find "${countryName}" in country-state-city library.`,
        confirmButtonText: 'OK',
      });
      return;
    }

    this.subscriberCountryIso = countryObj.isoCode;

    const libStates = State.getStatesOfCountry(countryObj.isoCode) || [];
    this.states = libStates.map((s: any) => ({ name: s.name, isoCode: s.isoCode }));

    this.isStatesLoading = false;
  }
  private normalize(s: string): string {
    return (s || '').trim().toLowerCase();
  }

  // ===== load cities from library =====
  loadCitiesFromLibrary() {
    this.isCitiesLoading = true;

    const countryName = this.readCountryNameFromLocalStorage();
    this.subscriberCountryName = countryName;

    if (!countryName) {
      this.cities = [];
      this.isCitiesLoading = false;
      return;
    }

    // match exact by name from library
    const all = Country.getAllCountries();
    const exact = all.find((c:any) => this.normalize(c.name) === this.normalize(countryName));

    // fallback contains
    const loose = exact ?? all.find((c:any) =>
      this.normalize(c.name).includes(this.normalize(countryName)) ||
      this.normalize(countryName).includes(this.normalize(c.name))
    );

    if (!loose?.isoCode) {
      this.cities = [];
      this.isCitiesLoading = false;

      Swal.fire({
        icon: 'error',
        title: 'Country not found',
        text: `Cannot find "${countryName}" in country-state-city library.`,
        confirmButtonText: 'OK',
      });
      return;
    }

    this.subscriberCountryIso = loose.isoCode;

    const libCities = State.getStatesOfCountry(loose.isoCode) || [];
    this.cities = libCities.map((x:any) => ({ name: x.name }));

    this.isCitiesLoading = false;
  }

  // ===== mapping branches api -> ui =====
  private mapApiToUi(item: any): Branch {
    const uiStatus: 'Active' | 'Inactive' = item.status === 'ACTIVE' ? 'Active' : 'Inactive';

    return {
      id: item.id,
      name: item.name,
      city: item.city ?? '—',
      status: uiStatus,
      manager: item.manager
        ? {
            fullName: item.manager.fullName,
            email: item.manager.email,
            phone: item.manager.phone,
            startDate: item.manager.startDate,
          }
        : null,
      selected: false,
    };
  }

  // ===== GET branches =====
  fetchBranches() {
    this.isLoading = true;

    this.branchService.getBranches(this.currentPage, this.itemsPerPage).subscribe({
      next: (res) => {
        this.allBranches = (res.data ?? []).map((x) => this.mapApiToUi(x));
        this.totalItems = res.total ?? this.allBranches.length;
        this.paginationInput = this.currentPage;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to load branches',
          text: this.extractBackendErrorMessage(err),
          confirmButtonText: 'OK',
        });
      },
    });
  }

  // ===== Modal open/close =====
  openAddBranchModal() {
    this.mode = 'add';
    this.editingBranch = null;
    this.currentStep = 1;
    this.isSubmitting = false;

    // refresh cities in case country changed
    if (!this.cities.length && !this.isCitiesLoading) this.loadCitiesFromLibrary();

    this.branchForm.reset({
      name: '',
      cityName: null,
      managerName: '',
      managerEmail: '',
      managerPhone: '',
      startDate: '',
    });

    this.showModal = true;
  }

  openEditBranchModal(branch: Branch) {
    this.mode = 'edit';
    this.editingBranch = branch;
    this.currentStep = 1;
    this.isSubmitting = false;

    if (!this.cities.length && !this.isCitiesLoading) this.loadCitiesFromLibrary();

    this.branchForm.reset({
      name: branch.name ?? '',
      cityName: branch.city ?? null,

      managerName: branch.manager?.fullName ?? '',
      managerEmail: branch.manager?.email ?? '',
      managerPhone: branch.manager?.phone ?? '',
      startDate: branch.manager?.startDate ? this.isoToDateInput(branch.manager.startDate) : '',
    });

    this.branchForm.markAsPristine();
    Object.values(this.branchForm.controls).forEach(c => c.markAsPristine());

    this.showModal = true;
    this.closeMenu();
  }

  closeModal() {
    this.showModal = false;
  }

  nextStep() {
    this.ctrl('name')?.markAsTouched();
    this.ctrl('cityName')?.markAsTouched();

    if (this.ctrl('name')?.invalid || this.ctrl('cityName')?.invalid) return;
    this.currentStep = 2;
  }

  prevStep() {
    this.currentStep = 1;
  }

  private isoToDateInput(iso: string): string {
    return iso ? iso.slice(0, 10) : '';
  }

  // ===== submit add/edit =====
  submitBranch() {
    this.branchForm.markAllAsTouched();
    if (this.branchForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete data',
        text: 'Please fill all required fields correctly.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const form = this.branchForm.value;

    // ✅ هنرسل cityName بدل cityId
    const fullPayload = {
      name: String(form.name ?? '').trim(),
      cityName: String(form.cityName ?? '').trim(),

      managerName: String(form.managerName ?? '').trim(),
      managerEmail: String(form.managerEmail ?? '').trim(),
      managerPhone: String(form.managerPhone ?? '').trim(),
      startDate: String(form.startDate ?? ''),
    };

    this.isSubmitting = true;

    if (this.mode === 'add') {
      this.branchService.addBranch(fullPayload).subscribe({
        next: () => {
          this.isSubmitting = false;
          Swal.fire({ icon: 'success', title: 'Success', text: 'Branch added successfully.', confirmButtonText: 'OK' });
          this.closeModal();
          this.currentPage = 1;
          this.fetchBranches();
        },
        error: (err) => {
          this.isSubmitting = false;
          Swal.fire({ icon: 'error', title: 'Failed', text: this.extractBackendErrorMessage(err), confirmButtonText: 'OK' });
        }
      });
      return;
    }

    if (!this.editingBranch) {
      this.isSubmitting = false;
      Swal.fire({ icon: 'error', title: 'Failed', text: 'No branch selected.', confirmButtonText: 'OK' });
      return;
    }

    // dirty only
    const updatePayload: any = {};
    Object.keys(this.branchForm.controls).forEach((key) => {
      const control = this.branchForm.get(key);
      if (control?.dirty) updatePayload[key] = (fullPayload as any)[key];
    });

    if (Object.keys(updatePayload).length === 0) {
      this.isSubmitting = false;
      Swal.fire({ icon: 'info', title: 'No changes', text: 'You did not change anything.', confirmButtonText: 'OK' });
      this.closeModal();
      return;
    }

    // بعض الباكندات بتحتاج name دايمًا
    if (!updatePayload.name) updatePayload.name = fullPayload.name;

    this.branchService.updateBranch(this.editingBranch.id, updatePayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Branch updated successfully.', confirmButtonText: 'OK' });
        this.closeModal();
        this.fetchBranches();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({ icon: 'error', title: 'Failed', text: this.extractBackendErrorMessage(err), confirmButtonText: 'OK' });
      }
    });
  }

  // ===== table search =====
  get displayedBranches(): Branch[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.allBranches;

    return this.allBranches.filter((b) =>
      (b.name || '').toLowerCase().includes(term) ||
      (b.city || '').toLowerCase().includes(term)
    );
  }

  // ===== pagination =====
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    if (total <= 1) return [1];

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) range.push(i);
    }
    range.push(total);

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
    this.fetchBranches();
  }

  goToInputPage() {
    this.changePage(this.paginationInput);
  }

  // ===== checkbox =====
  get isAllSelected(): boolean {
    return this.displayedBranches.length > 0 && this.displayedBranches.every((b) => b.selected);
  }

  get isPartiallySelected(): boolean {
    const selectedCount = this.displayedBranches.filter((b) => b.selected).length;
    return selectedCount > 0 && selectedCount < this.displayedBranches.length;
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.displayedBranches.forEach((b) => (b.selected = isChecked));
  }

  toggleRow(branch: Branch) {
    branch.selected = !branch.selected;
  }

  statusLabel(status: Branch['status']) {
    return status === 'Active' ? this.t('active') : this.t('inactive');
  }

  // ===== menu/status update =====
  toggleMenu(branchId: number) {
    this.openMenuBranchId = this.openMenuBranchId === branchId ? null : branchId;
  }

  closeMenu() {
    this.openMenuBranchId = null;
  }

  private toApiStatus(ui: 'Active' | 'Inactive'): 'ACTIVE' | 'INACTIVE' {
    return ui === 'Active' ? 'ACTIVE' : 'INACTIVE';
  }

  updateStatus(branch: Branch, uiStatus: 'Active' | 'Inactive') {
    if (branch.status === uiStatus) {
      this.closeMenu();
      return;
    }

    const payload = {
      name: branch.name,
      status: this.toApiStatus(uiStatus)
    };

    this.isUpdatingStatus = true;
    const oldStatus = branch.status;
    branch.status = uiStatus;

    this.branchService.updateBranchStatus(branch.id, payload).subscribe({
      next: () => {
        this.isUpdatingStatus = false;
        this.closeMenu();
        Swal.fire({ icon: 'success', title: 'Updated', text: `Branch status changed to ${uiStatus}.`, confirmButtonText: 'OK' });
      },
      error: (err) => {
        this.isUpdatingStatus = false;
        branch.status = oldStatus;
        Swal.fire({ icon: 'error', title: 'Failed', text: this.extractBackendErrorMessage(err), confirmButtonText: 'OK' });
      }
    });
  }
}
