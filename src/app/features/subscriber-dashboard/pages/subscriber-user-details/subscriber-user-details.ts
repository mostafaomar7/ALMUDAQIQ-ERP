import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

import { UserDetailsService, UserDetailsResponse } from './user-details.service'; // عدّل المسار لو مختلف

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriber-user-details.html',
  styleUrls: ['./subscriber-user-details.css'],
})
export class SubscriberUserDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // i18n
  translations: typeof EN = EN;

  loading = false;
  errorMsg = '';

  // UI model
  userInfo = {
    fullName: '',
    email: '',
    phone: '',
    status: 'Inactive' as 'Active' | 'Inactive',
    jobTitle: '-',
    joinDate: '-',
  };

  branchInfo = {
    name: '-',
    city: '-',
    status: '-',
  };

  // Stats (زي branch details)
  stats = [
    { labelKey: 'role', value: '-', icon: 'users' },
    { labelKey: 'branch', value: '-', icon: 'file' },
    { labelKey: 'status', value: '-', icon: 'users-group' },
    { labelKey: 'mustChangePassword', value: '-', icon: 'money' },
  ] as const;

  // Tables placeholders
  permissions: { name: string; selected: boolean }[] = [];
  assignedDevices: { name: string; selected: boolean }[] = [];

  constructor(
    private route: ActivatedRoute,
    private userSrv: UserDetailsService,
    private lang: TranslateService
  ) {}

  ngOnInit(): void {
    this.lang.lang$.pipe(takeUntil(this.destroy$)).subscribe((l) => this.loadTranslations(l));

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.errorMsg = 'Invalid user id';
      return;
    }

    this.fetchUserDetails(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  tAny(key: string): string {
    return (this.translations as any)[key] || key;
  }

  statusLabel(status: 'Active' | 'Inactive') {
    return status === 'Active' ? this.t('active') : this.t('inactive');
  }

  // selection helpers
  get isAllPermissionsSelected(): boolean {
    return this.permissions.length > 0 && this.permissions.every((p) => p.selected);
  }
  toggleAllPermissions() {
    const current = this.isAllPermissionsSelected;
    this.permissions.forEach((p) => (p.selected = !current));
  }
  togglePermission(p: { selected: boolean }) {
    p.selected = !p.selected;
  }

  get isAllDevicesSelected(): boolean {
    return this.assignedDevices.length > 0 && this.assignedDevices.every((d) => d.selected);
  }
  toggleAllDevices() {
    const current = this.isAllDevicesSelected;
    this.assignedDevices.forEach((d) => (d.selected = !current));
  }
  toggleDevice(d: { selected: boolean }) {
    d.selected = !d.selected;
  }

  private fetchUserDetails(id: number) {
    this.loading = true;
    this.errorMsg = '';

    this.userSrv.getUserDetails(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: UserDetailsResponse) => {
        const status: 'Active' | 'Inactive' =
          String(res.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive';

        const roleName = res.Role?.name ?? `ROLE_${res.roleId}`;
        const mustChange = !!res.mustChangePassword;

        this.userInfo = {
          fullName: res.fullName ?? '',
          email: res.email ?? '',
          phone: res.phone ?? '',
          status,
          jobTitle: res.jobTitle ?? '-',
          joinDate: res.startDate ? res.startDate.slice(0, 10) : '-',
        };

        this.branchInfo = {
          name: res.branch?.name ?? '-',
          city: res.branch?.cityName ?? '-',
          status: res.branch?.status ?? '-',
        };

        // stats values
        (this.stats as any) = this.stats.map((s) => {
          if (s.labelKey === 'role') return { ...s, value: roleName };
          if (s.labelKey === 'branch') return { ...s, value: this.branchInfo.name };
          if (s.labelKey === 'status') return { ...s, value: status };
          if (s.labelKey === 'mustChangePassword') return { ...s, value: mustChange ? 'Yes' : 'No' };
          return s;
        });

        // permissions/devices from API (عندك غالبًا null)
        const perms = Array.isArray(res.permissions) ? res.permissions : [];
        this.permissions = perms.map((p: any) => ({ name: String(p?.name ?? p), selected: false }));

        // assignedDevices ممكن يبقى string JSON أو array أو null
        let devices: any[] = [];
        const rawDevices: any = (res as any).assignedDevices;

        try {
          if (Array.isArray(rawDevices)) devices = rawDevices;
          else if (typeof rawDevices === 'string' && rawDevices.trim()) devices = JSON.parse(rawDevices);
        } catch {
          devices = [];
        }

        this.assignedDevices = devices.map((d: any) => ({ name: String(d?.name ?? d), selected: false }));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to load user details';
      },
    });
  }
}
