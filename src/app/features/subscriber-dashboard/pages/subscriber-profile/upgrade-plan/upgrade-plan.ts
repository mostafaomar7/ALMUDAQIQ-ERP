import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, ApiPlan } from '../profile.service'; // عدّل المسار عندك

interface PlanCardVM {
  id: number;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  isHighlighted: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-upgrade-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-plan.html',
styleUrls: ['./upgrade-plan.css']
})
export class UpgradePlan implements OnInit {
  loading = false;
  errorMsg = '';
  upgradingId: number | null = null;
  // 🔔 Toast state
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  plans: PlanCardVM[] = [];
 private showMessage(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.errorMsg = '';

    this.profileService.getPlans().subscribe({
      next: (res: ApiPlan[]) => {
        // فلترة الباقات الفعّالة فقط (اختياري)
        const activePlans = (res ?? []).filter(p => p.isActive);

        // highlight: خلي أغلى/أشهر باقة في النص (اختياري)
        const maxFees = Math.max(...activePlans.map(p => p.paidFees), 0);

        this.plans = activePlans.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.paidFees,
          currency: 'SAR',
          period: p.durationMonths ? `/ ${p.durationMonths} months` : '',
          description: p.description,
          features: [
            `Users limit: ${p.usersLimit}`,
            `Files limit: ${p.fileLimit}`,
            `Max file size: ${p.maxFileSizeMB} MB`,
            `Branches limit: ${p.branchesLimit}`,
            `Duration: ${p.durationMonths} months`,
          ],
          isHighlighted: p.paidFees === maxFees, // اختياري
          isActive: p.isActive,
        }));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Failed to load plans';
      },
    });
  }

onUpgrade(planId: number): void {
  console.log('clicked planId:', planId);


  this.upgradingId = planId;
  this.errorMsg = '';

  this.profileService.upgradePlan(planId).subscribe({
    next: () => {
      this.upgradingId = null;
      this.showMessage('Plan upgraded successfully 🎉', 'success');
    },
    error: (err) => {
      this.upgradingId = null;
      this.showMessage(err?.error?.message ?? 'Failed to upgrade plan', 'error');
    },
  });
}

}
