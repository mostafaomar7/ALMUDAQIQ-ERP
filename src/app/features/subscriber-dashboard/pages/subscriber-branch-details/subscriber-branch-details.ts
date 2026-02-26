import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

import { BranchdetailsService, BranchDetailsResponse } from './branchdetails.service';

interface EmployeeUI {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-branch-details',
  standalone: true,
  imports: [CommonModule , RouterLink],
  templateUrl: './subscriber-branch-details.html',
  styleUrl: './subscriber-branch-details.css',
})
export class SubscriberBranchDetails implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  translations: typeof EN = EN;

  loading = false;
  errorMsg = '';

  // هيتعبّوا من الـ API
  branchInfo = { name: '', city: '', status: '' };
  managerInfo = { name: '', jobTitle: '', email: '', phone: '', joinDate: '' };

  // Stats (دلوقتي هنحسب موظفين من users)
  stats = [
    { labelKey: 'revenue', value: '-', icon: 'money' },
    { labelKey: 'clients', value: '-', icon: 'users' },
    { labelKey: 'activeContracts', value: '-', icon: 'file' },
    { labelKey: 'employees', value: '0', icon: 'users-group' },
  ] as const;

  employees: EmployeeUI[] = [];
  clients: any[] = []; // لحد ما يبقى عندك endpoint للـ clients

  constructor(
    private lang: TranslateService,
    private route: ActivatedRoute,
    private branchSrv: BranchdetailsService
  ) {}

  ngOnInit(): void {
    this.lang.lang$.pipe(takeUntil(this.destroy$)).subscribe(l => this.loadTranslations(l));

    const idParam = this.route.snapshot.paramMap.get('id');
    const branchId = Number(idParam);

    if (!branchId || Number.isNaN(branchId)) {
      this.errorMsg = 'Invalid branch id';
      return;
    }

    this.fetchBranchDetails(branchId);
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

  fetchBranchDetails(id: number) {
    this.loading = true;
    this.errorMsg = '';

    this.branchSrv.getBranchDetails(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: BranchDetailsResponse) => {
        // Branch header
        this.branchInfo = {
          name: res.name ?? '',
          city: res.cityName ?? '',
          status: (res.status ?? '').toUpperCase(),
        };

        // Manager
        const m = res.manager;
        this.managerInfo = {
          name: m?.fullName ?? '-',
          jobTitle: m?.jobTitle ?? 'Branch Manager',
          email: m?.email ?? '-',
          phone: m?.phone ?? '-',
          joinDate: m?.startDate ? m.startDate.slice(0, 10) : '-',
        };

        // Employees table (من users)
        const users = res.users ?? [];
        this.employees = users.map(u => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          role: String(u.roleId ?? ''), // لو عندك role name endpoint بدّله
          status: (String(u.status || '').toLowerCase() === 'active') ? 'Active' : 'Inactive',
          selected: false,
        }));

        // Stats
        const empCount = this.employees.length;
        (this.stats as any) = this.stats.map(s =>
          s.labelKey === 'employees'
            ? { ...s, value: String(empCount) }
            : s
        );

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to load branch details';
      },
    });
  }

  statusLabel(status: 'Active' | 'Inactive') {
    return status === 'Active' ? this.t('active') : this.t('inactive');
  }

  get isAllEmployeesSelected(): boolean {
    return this.employees.length > 0 && this.employees.every(e => e.selected);
  }
  toggleAllEmployees() {
    const current = this.isAllEmployeesSelected;
    this.employees.forEach(e => (e.selected = !current));
  }
  toggleEmployee(emp: EmployeeUI) {
    emp.selected = !emp.selected;
  }

  // Clients selection/sort (لو هتفضلهم ثابتين مؤقتًا)
  get isAllClientsSelected(): boolean {
    return this.clients.length > 0 && this.clients.every((c: any) => c.selected);
  }
  toggleAllClients() {
    const current = this.isAllClientsSelected;
    this.clients.forEach((c: any) => (c.selected = !current));
  }
  toggleClient(client: any) {
    client.selected = !client.selected;
  }

  sortDirection: { [key: string]: 'asc' | 'desc' } = {};
  sortData(listType: 'employees' | 'clients', key: string) {
    const data = listType === 'employees' ? (this.employees as any[]) : (this.clients as any[]);
    const direction = this.sortDirection[key] === 'asc' ? 'desc' : 'asc';
    this.sortDirection[key] = direction;

    data.sort((a, b) => {
      const A = String(a[key] ?? '').toLowerCase();
      const B = String(b[key] ?? '').toLowerCase();
      if (A < B) return direction === 'asc' ? -1 : 1;
      if (A > B) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
