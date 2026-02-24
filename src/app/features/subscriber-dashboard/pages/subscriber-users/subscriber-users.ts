import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TranslateService } from '../../../../core/services/translate.service'; // عدّل المسار حسب مشروعك
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
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
  // i18n
  translations: typeof EN = EN;

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  // مصدر البيانات
  allUsers: User[] = [];

  // إعدادات الباجينيشن
  currentPage = 1;
  itemsPerPage = 10;
  paginationInput = 1;

  // (اختياري) لو هتشتغل Search بعدين
  searchTerm = '';

  constructor(private lang: TranslateService) {}

  ngOnInit() {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.generateMockData();
  }

  // توليد بيانات وهمية للمستخدمين
  generateMockData() {
    const firstNames = ['Ahmed', 'Mohamed', 'Omar', 'Ali', 'Khaled', 'Saeed'];
    const lastNames = ['Saeed', 'Mohamed', 'Omar', 'Adel', 'Hassan', 'Ibrahim'];
    const roles = ['Secretariat', 'Audit Manager', 'Technical Auditor', 'Branch Manager'];
    const branches = ['Cairo HQ', 'Dubai Branch', 'Riyadh Office', 'Jeddah Branch'];
    const statuses: ('Active' | 'Inactive')[] = ['Active', 'Inactive'];

    for (let i = 1; i <= 1250; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;

      this.allUsers.push({
        id: i,
        fullName,
        email: `${fName.toLowerCase()}@almudaqiq.com`,
        role: roles[i % roles.length],
        branch: branches[i % branches.length],
        status: statuses[i % 2],
        selected: false,
      });
    }
  }

  // 1) البيانات المعروضة
  get displayedUsers(): User[] {
    // لو هتفعل Search بعدين، هنا تعمل filter قبل slice
    const list = this.allUsers;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return list.slice(startIndex, endIndex);
  }

  // 2) إجمالي الصفحات
  get totalPages(): number {
    return Math.ceil(this.allUsers.length / this.itemsPerPage);
  }

  // 3) صفحات مع dots
  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

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

  // 4) تغيير صفحة
  changePage(page: number | string) {
    if (page === '...' || typeof page !== 'number') return;
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.paginationInput = page;
  }

  goToInputPage() {
    this.changePage(this.paginationInput);
  }

  // Selection Logic
  get isAllSelected(): boolean {
    return this.displayedUsers.length > 0 && this.displayedUsers.every((u) => u.selected);
  }

  get isPartiallySelected(): boolean {
    const selectedCount = this.displayedUsers.filter((u) => u.selected).length;
    return selectedCount > 0 && selectedCount < this.displayedUsers.length;
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.displayedUsers.forEach((u) => (u.selected = isChecked));
  }

  toggleRow(user: User) {
    user.selected = !user.selected;
  }

  // status text translated
  statusLabel(status: User['status']) {
    return status === 'Active' ? this.t('active') : this.t('inactive');
  }
}
