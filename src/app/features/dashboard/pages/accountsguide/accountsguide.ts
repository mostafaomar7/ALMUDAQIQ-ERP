import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Account {
  id: number;
  name: string;
  level: string;
  number: string;
  rules: string;
  notes: string;
  code: string;
  selected: boolean;
}

@Component({
  selector: 'app-accountsguide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accountsguide.html',
  styleUrls: ['./accountsguide.css'],
})
export class Accountsguide implements OnInit {
  // البيانات الكاملة (سنقوم بتوليدها لمحاكاة عدد كبير)
  allAccounts: Account[] = [];

  // البيانات المعروضة في الصفحة الحالية فقط
  displayedAccounts: Account[] = [];

  // إعدادات الترقيم
  currentPage: number = 101; // البدء من صفحة 101 كما في الصورة
  itemsPerPage: number = 10;
  totalItems: number = 1250;
  totalPages: number = 0;

  // لتخزين أرقام الصفحات التي ستظهر في الشريط السفلي
  pagesArray: (number | string)[] = [];

  // بيانات نموذجية للتكرار
  private sampleData = [
    { name: 'Accounts Receivable', level: 'Level 1', number: '1001', rules: 'IAS 38 – Intangibles', notes: 'Costs not yet billed', code: 'A01' },
    { name: 'Bank Accounts', level: 'Level 2', number: '3001', rules: 'IAS 16 – PPE', notes: 'Recognized monthly', code: 'A02' },
    { name: 'Advances to Suppliers', level: 'Level 3', number: '4002', rules: 'IFRS 16 – Leases', notes: 'Costs not yet billed', code: 'A04' },
    { name: 'Property Equipment', level: 'Level 5', number: '5005', rules: 'IAS 16 – PPE', notes: 'Annual provision', code: 'A11' },
    { name: 'Zakat Provision', level: 'Level 12', number: '4002', rules: 'IAS 38 – Intangibles', notes: 'Annual provision', code: 'A18' }
  ];

  ngOnInit() {
    this.generateDummyData();
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updateDisplayedData();
    this.calculatePagination();
  }

  // دالة لتوليد 1250 عنصر وهمي
  generateDummyData() {
    for (let i = 1; i <= this.totalItems; i++) {
      const randomSample = this.sampleData[i % this.sampleData.length];
      this.allAccounts.push({
        id: i,
        name: randomSample.name,
        level: `Level ${Math.floor(Math.random() * 15) + 1}`, // مستويات عشوائية
        number: (1000 + i).toString(),
        rules: randomSample.rules,
        notes: randomSample.notes,
        code: `A${i}`,
        selected: false
      });
    }
  }

  // تحديث البيانات المعروضة بناءً على الصفحة الحالية
  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedAccounts = this.allAccounts.slice(startIndex, endIndex);
  }

  // الانتقال إلى صفحة محددة
  goToPage(page: number | string) {
    if (typeof page === 'string') return; // في حالة الضغط على النقاط "..."
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  // الصفحة التالية
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  // الصفحة السابقة
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
      this.calculatePagination();
    }
  }

  // الذهاب للصفحة عبر مربع الإدخال
  goToPageInput(event: any) {
    const page = parseInt(event.target.value);
    if (!isNaN(page)) {
      this.goToPage(page);
    }
  }

  // حساب أرقام الصفحات التي ستظهر (الخوارزمية لمحاكاة الشكل: 1 ... 99 100 101 ... 125)
  calculatePagination() {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2; // عدد الصفحات حول الصفحة الحالية
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    // نضع الصفحة الأولى، الأخيرة، والصفحات حول الصفحة الحالية
    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
      if (i < total && i > 1) {
        range.push(i);
      }
    }
    range.push(total);

    // إزالة التكرار وترتيب العناصر
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // إضافة النقاط "..."
    uniqueRange.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    this.pagesArray = rangeWithDots;
  }

  // دوال التحديد Checkbox
  toggleSelection(account: Account) {
    account.selected = !account.selected;
  }

  toggleAll() {
    const allSelected = this.displayedAccounts.every(a => a.selected);
    this.displayedAccounts.forEach(a => a.selected = !allSelected);
  }

  // معلومات النص السفلي (مثال: 110-120 of 1,250)
  get showingRangeText(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `${start}-${end} of ${this.totalItems.toLocaleString()}`;
  }
}
