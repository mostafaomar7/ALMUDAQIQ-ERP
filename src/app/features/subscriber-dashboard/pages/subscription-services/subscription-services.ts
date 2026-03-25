// subscription-services.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // مهم للـ ngModel الخاص بالبحث والـ Jump Page
import { ContractService } from './contract-service.service';
import { Contract } from './contract.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-services',
  standalone: true,
  imports: [CommonModule, FormsModule], // إضافة FormsModule هنا
  templateUrl: './subscription-services.html',
  styleUrl: './subscription-services.css',
})
export class SubscriptionServices implements OnInit {
  Math = Math;
  private contractService = inject(ContractService);

  contracts: Contract[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isLoading: boolean = false;

  // للبحث
  searchTerm: string = '';
  searchSubject: Subject<string> = new Subject<string>();

  // للترقيم (Pagination)
  pagesArray: (number | string)[] = [];
  jumpToPageInput: number | null = null;

  ngOnInit(): void {
    this.loadContracts();

    // الاستماع لتغييرات البحث مع تأخير 500 ملي ثانية
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchValue) => {
      this.searchTerm = searchValue;
      this.currentPage = 1; // عند البحث نعود دائماً للصفحة الأولى
      this.loadContracts();
    });
  }

  loadContracts(): void {
    this.isLoading = true;
    this.contractService.getContracts(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.contracts = response.data;
        this.totalItems = response.total;
        this.currentPage = response.page;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.calculatePagination(); // حساب أرقام الصفحات بعد جلب البيانات
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching contracts:', error);
        this.isLoading = false;
      }
    });
  }

  // عند الكتابة في مربع البحث
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  // عند الضغط على رقم صفحة أو Next / Back
  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadContracts();
    }
  }

  // دالة الانتقال السريع لصفحة معينة (Jump to Page)
  jumpToPage(): void {
    if (this.jumpToPageInput && this.jumpToPageInput >= 1 && this.jumpToPageInput <= this.totalPages) {
      this.onPageChange(this.jumpToPageInput);
      this.jumpToPageInput = null; // تفريغ الحقل بعد الانتقال
    }
  }

  // المنطق الخاص بتوليد أرقام الصفحات (مثال: 1 ... 4 5 6 ... 10)
  calculatePagination(): void {
    const current = this.currentPage;
    const last = this.totalPages;
    const delta = 2; // عدد الصفحات التي تظهر بجوار الصفحة الحالية
    const left = current - delta;
    const right = current + delta;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l;

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= left && i <= right)) {
        range.push(i);
      }
    }

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

    this.pagesArray = rangeWithDots;
  }
}
