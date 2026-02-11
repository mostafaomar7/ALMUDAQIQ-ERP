import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

@Component({
  selector: 'app-subscriber-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriber-users.html',
  styleUrls: ['./subscriber-users.css'],
})
export class SubscriberUsers implements OnInit {
  // مصدر البيانات
  allUsers: User[] = [];

  // إعدادات الباجينيشن
  currentPage = 101;
  itemsPerPage = 10;
  paginationInput = 101;

  ngOnInit() {
    this.generateMockData();
  }

  // توليد بيانات وهمية للمستخدمين
  generateMockData() {
    const firstNames = ['Ahmed', 'Mohamed', 'Omar', 'Ali', 'Khaled', 'Saeed'];
    const lastNames = ['Saeed', 'Mohamed', 'Omar', 'Adel', 'Hassan', 'Ibrahim'];
    const roles = ['Secretariat', 'Audit Manager', 'Technical Auditor', 'Branch Manager'];
    const branches = ['Cairo HQ', 'Dubai Branch', 'Riyadh Office', 'Jeddah Branch'];
    const statuses: ('Active' | 'Inactive')[] = ['Active', 'Inactive'];

    // توليد 1250 عنصر
    for (let i = 1; i <= 1250; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${fName} ${lName}`;

      this.allUsers.push({
        id: i,
        fullName: fullName,
        email: `${fName.toLowerCase()}@almudaqiq.com`,
        role: roles[i % roles.length],
        branch: branches[i % branches.length],
        status: statuses[i % 2], // تبديل بين Active/Inactive
        selected: false
      });
    }
  }

  // 1. حساب البيانات المعروضة
  get displayedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allUsers.slice(startIndex, endIndex);
  }

  // 2. حساب إجمالي الصفحات
  get totalPages(): number {
    return Math.ceil(this.allUsers.length / this.itemsPerPage);
  }

  // 3. حساب أرقام الصفحات (Logic for dots ...)
  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) {
        range.push(i);
      }
    }
    range.push(total);

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  }

  // 4. دالة التنقل
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
    return this.displayedUsers.length > 0 && this.displayedUsers.every(u => u.selected);
  }

  get isPartiallySelected(): boolean {
    const selectedCount = this.displayedUsers.filter(u => u.selected).length;
    return selectedCount > 0 && selectedCount < this.displayedUsers.length;
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.displayedUsers.forEach(u => u.selected = isChecked);
  }

  toggleRow(user: User) {
    user.selected = !user.selected;
  }
}
