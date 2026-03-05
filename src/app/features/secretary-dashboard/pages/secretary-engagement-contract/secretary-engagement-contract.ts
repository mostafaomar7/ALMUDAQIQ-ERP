import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, map } from 'rxjs/operators';

import {
  SeretaryEngagementContractService,
  ApiEngagementContract,
  EngagementContractsResponse,
} from './seretary-engagement-contract.service';

interface Contract {
  id: string; // Contract No. (contractNumber)
  establishmentName: string; // customerName
  contractDate: string; // ISO date string (formatted in HTML)
  legalEntity: 'Company' | 'Institution' | 'Individual';
  crNumber: string;
  taxNumber: string;
  unifiedNumber: string;
  status: 'Active' | 'Inactive';
  selected: boolean;
}

@Component({
  selector: 'app-secretary-engagement-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './secretary-engagement-contract.html',
  styleUrl: './secretary-engagement-contract.css',
})
export class SecretaryEngagementContract implements OnInit {
  // Search model
  searchTerm = '';
  jumpToPage = 1;

  // Data
  contracts: Contract[] = [];
  loading = false;

  // Pagination from API
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  // UI range
  startItem = 0;
  endItem = 0;

  constructor(private contractsApi: SeretaryEngagementContractService) {}

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts(page: number = this.currentPage) {
    this.loading = true;

    this.contractsApi
      .getContracts({ page, limit: this.pageSize, search: this.searchTerm })
      .pipe(
        map((res: EngagementContractsResponse) => {
          const mapped = res.data.map((c) => this.toVM(c));
          return { ...res, data: mapped };
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          this.contracts = res.data;
          this.totalItems = res.total;
          this.currentPage = res.page;
          this.pageSize = res.limit;

          this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));

          this.startItem = this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
          this.endItem = Math.min(this.totalItems, this.currentPage * this.pageSize);
        },
        error: (err) => {
          console.error('Failed to load engagement contracts', err);
          this.contracts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.startItem = 0;
          this.endItem = 0;
        },
      });
  }

  private toVM(c: ApiEngagementContract): Contract {
    return {
      id: c.contractNumber,
      establishmentName: c.customerName,
      contractDate: c.engagementContractDate, // ✅ ISO string
      legalEntity: c.legalEntity,
      crNumber: c.commercialRegisterNumber,
      taxNumber: c.taxNumber,
      unifiedNumber: c.unifiedNumber,
      status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
      selected: false,
    };
  }

  // Selection
  toggleSelection(contract: Contract) {
    contract.selected = !contract.selected;
  }

  toggleAll() {
    const allSelected = this.contracts.length > 0 && this.contracts.every((c) => c.selected);
    this.contracts.forEach((c) => (c.selected = !allSelected));
  }

  // Search
  onSearch() {
    this.currentPage = 1;
    this.jumpToPage = 1;
    this.loadContracts(1);
  }

  // Pagination
  nextPage() {
    if (this.currentPage < this.totalPages) this.loadContracts(this.currentPage + 1);
  }

  prevPage() {
    if (this.currentPage > 1) this.loadContracts(this.currentPage - 1);
  }

  goToPage() {
    const p = Math.min(Math.max(1, Number(this.jumpToPage || 1)), this.totalPages);
    this.jumpToPage = p;
    this.loadContracts(p);
  }
}
