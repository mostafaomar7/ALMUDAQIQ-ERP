import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { TranslateService } from '../../../../core/services/translate.service';
import { PlansmanagementService } from './plansmanagement.service';
import Swal from 'sweetalert2';

type TranslationKey = keyof typeof EN;

interface Plan {
  id: number;
  name: string;
  description: string;
  durationMonths: number;
  paidFees: number;
  branchesLimit: number;
  // clientsLimit: number;
  usersLimit: number;
  selected?: boolean;
  fileLimit : number ;
  maxFileSizeMB : number ;
}

@Component({
  selector: 'app-plansmanagement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plansmanagement.html',
  styleUrls: ['./plansmanagement.css'],
})
export class Plansmanagement {
  translations: typeof EN = EN;
  currentLang: 'en' | 'ar' = 'ar';
  plans: Plan[] = [];
  showForm = false;
  editingPlan: Plan = {} as Plan;

  constructor(
    private languageService: TranslateService,
    private service: PlansmanagementService
  ) {
    this.languageService.lang$.subscribe(lang => this.loadTranslations(lang));
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.service.getPlans().subscribe(plans => {
      this.plans = plans.map(p => ({
        id: p.id ?? 0,  // تأكيد أن الـ id رقم دائم
        name: p.name,
        description: p.description,
        durationMonths: p.durationMonths,
        paidFees: p.paidFees,
        usersLimit: p.usersLimit,
        // clientsLimit: p.clientsLimit,
        branchesLimit: p.branchesLimit,
        fileLimit : p.fileLimit ,
        maxFileSizeMB : p.maxFileSizeMB,
        selected: false,
      }));
    });
  }

  // 🔹 أزرار التحكم
  updateSelectedPlans() {
    const selected = this.plans.filter(p => p.selected);
    if (!selected.length) return alert('Please select at least one plan to update.');
    // فتح أول plan محدد للتعديل
    this.openEditForm(selected[0]);
  }

  addNewPlan() {
    this.editingPlan = {} as Plan;
    this.showForm = true;
  }

  openEditForm(plan: Plan) {
    this.editingPlan = { ...plan };
    this.showForm = true;
  }

  savePlan() {
  if (this.editingPlan.id) {
    this.service.updatePlan(this.editingPlan.id, this.editingPlan).subscribe({
      next: () => {
        this.loadPlans();
        this.showForm = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Plan has been updated successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update the plan.',
        });
      }
    });
  } else {
    this.service.addPlan(this.editingPlan).subscribe({
      next: () => {
        this.loadPlans();
        this.showForm = false;
        Swal.fire({
          icon: 'success',
          title: 'Added!',
          text: 'Plan has been added successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to add the plan.',
        });
      }
    });
  }
}

deletePlan(plan: Plan) {
  if (confirm('Are you sure to delete this plan?')) {
    this.service.deletePlan(plan.id).subscribe({
      next: () => {
        this.loadPlans();
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Plan has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete the plan.',
        });
      }
    });
  }
}
deleteSelectedPlans() {
  const selected = this.plans.filter(p => p.selected);

  if (!selected.length) {
    Swal.fire({
      icon: 'warning',
      title: 'No Selection',
      text: 'Please select at least one plan to delete.',
    });
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'You are about to delete selected plans!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
  }).then(result => {
    if (result.isConfirmed) {
      selected.forEach(p => {
        this.service.deletePlan(p.id).subscribe({
          next: () => {
            this.loadPlans();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Selected plans deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Failed to delete plan ${p.name}.`,
            });
          }
        });
      });
    }
  });
}

  cancelForm() {
    this.showForm = false;
  }

  toggleSelection(plan: Plan) {
    plan.selected = !plan.selected;
  }

  toggleAll() {
    const allSelected = this.plans.every(p => p.selected);
    this.plans.forEach(p => p.selected = !allSelected);
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.currentLang = lang;
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }
}
