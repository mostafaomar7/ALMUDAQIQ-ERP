import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateService } from '../../../../core/services/translate.service'; // عدّل المسار حسب مشروعك
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

// Interfaces
interface Employee {
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

interface Client {
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-branch-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriber-branch-details.html',
  styleUrl: './subscriber-branch-details.css',
})
export class SubscriberBranchDetails implements OnInit {
  // i18n
  translations: typeof EN = EN;

  constructor(private lang: TranslateService) {}

  ngOnInit(): void {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
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
  // ✅ Branch Info (هنا ثابتة زي ما عندك، ولو بعدين هتجيبها من API هتبدّل القيم)
branchInfo = {
    name: 'Cairo Branch',
    city: 'Cairo', // <-- أضفنا هذه
    email: 'cairo@almudaqiq.com',
    phone: '+20 100 555 7890',
    country: 'Egypt',
    address: '15 El Tahrir St, Cairo',
  };

  // ✅ إضافة Manager Info
  managerInfo = {
    name: 'Ahmed Ali',
    jobTitle: 'Branch Manager',
    email: 'Ahmed@gmail.com',
    phone: '01022809046',
    joinDate: '2026-02-23'
  }; 

  // Stats Data (بدل label نص ثابت نخليه key)
  stats = [
    { labelKey: 'revenue', value: '$12,400', icon: 'money' },
    { labelKey: 'clients', value: '24', icon: 'users' },
    { labelKey: 'activeContracts', value: '18', icon: 'file' },
    { labelKey: 'employees', value: '7', icon: 'users-group' },
  ] as const;

  // Employees
  employees: Employee[] = [
    { name: 'Ahmed Mohamed', email: 'ahmed@almudaqiq.com', role: 'Secretariat', status: 'Active', selected: false },
    { name: 'Ahmed Saeed', email: 'ahmed@almudaqiq.com', role: 'Audit Manager', status: 'Active', selected: false },
    { name: 'Mohamed Saeed', email: 'Mohamed@almudaqiq.com', role: 'Secretariat', status: 'Inactive', selected: false },
    { name: 'Mohamed Omar', email: 'Mohamed@almudaqiq.com', role: 'Audit Manager', status: 'Inactive', selected: false },
    { name: 'Ahmed Saeed', email: 'ahmed@almudaqiq.com', role: 'Secretariat', status: 'Active', selected: false },
    { name: 'Omar Adel', email: 'Omar@almudaqiq.com', role: 'Technical Auditor', status: 'Active', selected: false },
    { name: 'Mohamed Saeed', email: 'Mohamed@almudaqiq.com', role: 'Audit Manager', status: 'Inactive', selected: false },
  ];

  // Clients
  clients: Client[] = [
    { name: 'Al Noor Co.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
    { name: 'Green Valley Ltd.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
    { name: 'FutureTech', type: 'Mohamed@almudaqiq.com', status: 'Inactive', selected: false },
    { name: 'FutureTech', type: 'Mohamed@almudaqiq.com', status: 'Inactive', selected: false },
    { name: 'Green Valley Ltd.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
  ];

  // Status label translated
  statusLabel(status: 'Active' | 'Inactive') {
    return status === 'Active' ? this.t('active') : this.t('inactive');
  }

  // --- Employees Selection ---
  get isAllEmployeesSelected(): boolean {
    return this.employees.length > 0 && this.employees.every((e) => e.selected);
  }

  toggleAllEmployees() {
    const currentState = this.isAllEmployeesSelected;
    this.employees.forEach((e) => (e.selected = !currentState));
  }

  toggleEmployee(emp: Employee) {
    emp.selected = !emp.selected;
  }

  // --- Clients Selection ---
  get isAllClientsSelected(): boolean {
    return this.clients.length > 0 && this.clients.every((c) => c.selected);
  }

  toggleAllClients() {
    const currentState = this.isAllClientsSelected;
    this.clients.forEach((c) => (c.selected = !currentState));
  }

  toggleClient(client: Client) {
    client.selected = !client.selected;
  }

  // --- Sorting ---
  sortDirection: { [key: string]: 'asc' | 'desc' } = {};

  sortData(listType: 'employees' | 'clients', key: string) {
    const data = listType === 'employees' ? this.employees : this.clients;

    const direction = this.sortDirection[key] === 'asc' ? 'desc' : 'asc';
    this.sortDirection[key] = direction;

    data.sort((a: any, b: any) => {
      const valueA = String(a[key] ?? '').toLowerCase();
      const valueB = String(b[key] ?? '').toLowerCase();

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
