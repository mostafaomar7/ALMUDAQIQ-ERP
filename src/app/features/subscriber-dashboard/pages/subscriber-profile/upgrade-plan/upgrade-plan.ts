import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, ApiPlan } from '../profile.service';

import { TranslateService } from '../../../../../core/services/translate.service'; // عدّل المسار حسب مشروعك
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { RouterLink } from '@angular/router';

interface PlanCardVM {
  id: number;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  isActive: boolean;
}

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule , RouterLink],
  templateUrl: './upgrade-plan.html',
  styleUrls: ['./upgrade-plan.css'],
})
export class UpgradePlan implements OnInit {
  // i18n
  translations: typeof EN = EN;

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  loading = false;
  errorMsg = '';
  upgradingId: number | null = null;
  currentPlanId: number | null = null;
  selectedPlanId: number | null = null;

  // 🔔 Toast state
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;

  plans: PlanCardVM[] = [];

  constructor(private profileService: ProfileService, private lang: TranslateService) {}

  ngOnInit(): void {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));

    const saved = localStorage.getItem('selectedPlanId');
    if (saved) this.selectedPlanId = +saved;

    this.loadPlans();
  }

  selectPlan(planId: number) {
    this.selectedPlanId = planId;
    localStorage.setItem('selectedPlanId', planId.toString());
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  private formatPeriod(months?: number | null): string {
    if (!months) return '';
    // مثال: "/ 3 months" أو "/ 1 month"
    const unit = months === 1 ? this.t('month') : this.t('months');
    return `/ ${months} ${unit}`;
  }

  private buildFeatures(p: ApiPlan): string[] {
    // كل feature مترجم بمفتاح + قيمة
    // لاحظ: لو في قيم null/undefined، خليها 0 أو —
    const usersLimit = (p as any).usersLimit ?? 0;
    const fileLimit = (p as any).fileLimit ?? 0;
    const maxFileSizeMB = (p as any).maxFileSizeMB ?? 0;
    const branchesLimit = (p as any).branchesLimit ?? 0;
    const durationMonths = (p as any).durationMonths ?? 0;

    return [
      `${this.t('usersLimit')}: ${usersLimit}`,
      `${this.t('filesLimit')}: ${fileLimit}`,
      `${this.t('maxFileSize')}: ${maxFileSizeMB} ${this.t('mb')}`,
      `${this.t('branchesLimit')}: ${branchesLimit}`,
      `${this.t('duration')}: ${durationMonths} ${durationMonths === 1 ? this.t('month') : this.t('months')}`,
    ];
  }

  loadPlans(): void {
    this.loading = true;
    this.errorMsg = '';

    this.profileService.getPlans().subscribe({
      next: (res: ApiPlan[]) => {
        const activePlans = (res ?? []).filter((p) => p.isActive);

        const current = activePlans.find((p) => (p as any).isCurrent);
        this.currentPlanId = current?.id ?? null;

        this.plans = activePlans.map((p) => ({
          id: p.id,
          name: p.name,
          price: (p as any).paidFees ?? 0,
          currency: this.t('sar'),
          period: this.formatPeriod((p as any).durationMonths),
          description: (p as any).description ?? '',
          features: this.buildFeatures(p),
          isActive: p.isActive,
        }));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? this.t('failedToLoadPlans');
      },
    });
  }

  onUpgrade(planId: number): void {
    this.upgradingId = planId;
    this.errorMsg = '';

    this.profileService.upgradePlan(planId).subscribe({
      next: () => {
        this.upgradingId = null;

        this.currentPlanId = planId;
        this.selectedPlanId = null;
        localStorage.setItem('selectedPlanId', planId.toString());

        this.showMessage(this.t('planUpgradedSuccess'), 'success');
      },
      error: (err) => {
        this.upgradingId = null;
        this.showMessage(err?.error?.message ?? this.t('failedToUpgradePlan'), 'error');
      },
    });
  }
}
