import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from './profile.service';
import { SubscriberProfileResponse } from './profile.model';
import { RouterLink } from '@angular/router';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type UsageBar = { current: number; max: number; pct: number; label?: string };
type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './subscriber-profile.html',
  styleUrls: ['./subscriber-profile.css'],
})
export class SubscriberProfile implements OnInit {
  // i18n
  translations: typeof EN = EN;
  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  loading = false;
  errorMsg = '';

  companyInfo = {
    name: '',
    country: '',
    city: '',
    email: '',
  };

  licenseInfo = {
    name: '',
    type: '',
    number: '',
    date: '',
  };

  subscriptionDetails = {
    currentPlan: '',
    description: '',
    startDate: '',
    endDate: '',
    paidFees: 0,
    status: '',
    remainingDays: 0,
    usageBars: {
      users: { current: 0, max: 0, pct: 0 } as UsageBar,
      branches: { current: 0, max: 0, pct: 0 } as UsageBar,
      clients: { current: 0, max: 0, pct: 0 } as UsageBar,
      storage: { current: 0, max: 0, pct: 0, label: 'MB' } as UsageBar,
    },
  };

  authorityLinks = {
    cpa: '',
    ministry: '',
    tax: '',
  };

  constructor(
    private profileService: ProfileService,
    private lang: TranslateService
  ) {}

  ngOnInit(): void {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.loadProfile();
  }

  calculateWidth(current: number, max: number): string {
    if (!max || max <= 0) return '0%';
    const pct = Math.min(100, Math.max(0, (current / max) * 100));
    return `${pct}%`;
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMsg = '';

    this.profileService.getSubscriberProfile().subscribe({
      next: (res: SubscriberProfileResponse) => {
        const d = res?.data;

// Company
this.companyInfo.name = d?.license?.name ?? '';
this.companyInfo.country = d?.location?.country ?? '';
this.companyInfo.city = d?.location?.city ?? '';
this.companyInfo.email = ''; // ✅ لأن الـ model مفيهوش email // لو موجودة بأي مكان

        this.licenseInfo.name = d?.license?.name ?? '';
        this.licenseInfo.type = d?.license?.type ?? '';
        this.licenseInfo.number = d?.license?.number ?? '';
        this.licenseInfo.date = this.formatDate(d?.license?.date);

        this.subscriptionDetails.currentPlan = d?.plan?.name ?? '';
        this.subscriptionDetails.description = d?.plan?.description ?? '';
        this.subscriptionDetails.startDate = this.formatDate(d?.plan?.subscriptionStart);
        this.subscriptionDetails.endDate = this.formatDate(d?.plan?.subscriptionEnd);
        this.subscriptionDetails.paidFees = d?.plan?.paidFees ?? 0;
        this.subscriptionDetails.status = d?.plan?.status ?? '';
        this.subscriptionDetails.remainingDays = d?.plan?.usage?.subscription?.remainingDays ?? 0;

        const u = d?.plan?.usage;

        const usersUsed = u?.users?.used ?? 0;
        const usersLimit = u?.users?.limit ?? 0;

        const branchesUsed = u?.branches?.used ?? 0;
        const branchesLimit = u?.branches?.limit ?? 0;

        const clientsUsed = u?.clients?.used ?? 0;
        const clientsLimit = u?.clients?.limit ?? 0;

        const storageUsed = u?.storage?.usedMB ?? 0;
        const storageLimit = u?.storage?.limitMB ?? 0;

        this.subscriptionDetails.usageBars.users = {
          current: usersUsed,
          max: usersLimit,
          pct: u?.users?.percentage ?? this.safePct(usersUsed, usersLimit),
        };

        this.subscriptionDetails.usageBars.branches = {
          current: branchesUsed,
          max: branchesLimit,
          pct: u?.branches?.percentage ?? this.safePct(branchesUsed, branchesLimit),
        };

        this.subscriptionDetails.usageBars.clients = {
          current: clientsUsed,
          max: clientsLimit,
          pct: u?.clients?.percentage ?? this.safePct(clientsUsed, clientsLimit),
        };

        this.subscriptionDetails.usageBars.storage = {
          current: storageUsed,
          max: storageLimit,
          pct: u?.storage?.percentage ?? this.safePct(storageUsed, storageLimit),
          label: this.t('mb'), // لو عايزها تترجم
        };

        this.authorityLinks = {
          cpa: d?.location?.authorityLinks?.cpa ?? '',
          ministry: d?.location?.authorityLinks?.ministry ?? '',
          tax: d?.location?.authorityLinks?.tax ?? '',
        };

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? this.t('failedToLoadProfile');
      },
    });
  }

  private safePct(current: number, max: number): number {
    if (!max || max <= 0) return 0;
    return Math.round((current / max) * 100);
  }

  private formatDate(iso?: string): string {
    if (!iso) return '';
    const dt = new Date(iso);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
