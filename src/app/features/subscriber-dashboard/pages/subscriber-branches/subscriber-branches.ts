import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Branch {
  id: number;
  name: string;
  city: string;
  region: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

@Component({
  selector: 'app-subscriber-branches',
  standalone: true,
  imports: [CommonModule, FormsModule , RouterLink],
  templateUrl: './subscriber-branches.html',
  styleUrls: ['./subscriber-branches.css'], // تأكد من الاسم الصحيح للملف
})
export class SubscriberBranches implements OnInit {
  // المصدر الرئيسي للبيانات
  allBranches: Branch[] = [];

  // إعدادات الباجينيشن
  currentPage = 101; // نبدأ من 101 كما في التصميم
  itemsPerPage = 10;
  paginationInput = 101;

  ngOnInit() {
    this.generateMockData();
  }

  // توليد بيانات وهمية كثيرة لتجربة التصفح
  generateMockData() {
    const statuses: ('Active' | 'Inactive')[] = ['Active', 'Inactive'];
    const cities = ['Cairo', 'Riyadh', 'Dubai', 'Jeddah'];
    const regions = ['Egypt', 'Ksa', 'UAE'];

    // توليد 1250 عنصر
    for (let i = 1; i <= 1250; i++) {
      this.allBranches.push({
        id: i,
        name: i % 2 === 0 ? 'Cairo HQ' : 'Riyadh Office',
        city: cities[i % cities.length],
        region: regions[i % regions.length],
        status: statuses[i % 2],
        selected: false
      });
    }
  }

  // 1. حساب البيانات المعروضة في الجدول بناءً على الصفحة الحالية
  get displayedBranches(): Branch[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allBranches.slice(startIndex, endIndex);
  }

  // 2. حساب إجمالي عدد الصفحات
  get totalPages(): number {
    return Math.ceil(this.allBranches.length / this.itemsPerPage);
  }

  // 3. حساب مصفوفة أرقام الصفحات (اللوجيك الذكي للنقاط ...)
  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // عدد الصفحات التي تظهر قبل وبعد الصفحة الحالية
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

  // دوال الـ Selection
  get isAllSelected(): boolean {
    return this.displayedBranches.length > 0 && this.displayedBranches.every(b => b.selected);
  }

  get isPartiallySelected(): boolean {
    const selectedCount = this.displayedBranches.filter(b => b.selected).length;
    return selectedCount > 0 && selectedCount < this.displayedBranches.length;
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.displayedBranches.forEach(b => b.selected = isChecked);
  }

  toggleRow(branch: Branch) {
    branch.selected = !branch.selected;
  }
}
