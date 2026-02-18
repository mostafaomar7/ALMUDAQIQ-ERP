import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// تعريف Interfaces لتسهيل التعامل مع البيانات
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

@Component({
  selector: 'app-subscriber-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriber-branch-details.html',
  styleUrl: './subscriber-branch-details.css',
})
export class SubscriberBranchDetails{
  // Stats Data
  stats = [
    { label: 'Revenue', value: '$12,400', icon: 'money' },
    { label: 'Clients', value: '24', icon: 'users' },
    { label: 'Active Contracts', value: '18', icon: 'file' },
    { label: 'Employees', value: '7', icon: 'users-group' }
  ];

  // Employees Data (تم إضافة selected)
  employees: Employee[] = [
    { name: 'Ahmed Mohamed', email: 'ahmed@almudaqiq.com', role: 'Secretariat', status: 'Active', selected: false },
    { name: 'Ahmed Saeed', email: 'ahmed@almudaqiq.com', role: 'Audit Manager', status: 'Active', selected: false },
    { name: 'Mohamed Saeed', email: 'Mohamed@almudaqiq.com', role: 'Secretariat', status: 'Inactive', selected: false },
    { name: 'Mohamed Omar', email: 'Mohamed@almudaqiq.com', role: 'Audit Manager', status: 'Inactive', selected: false },
    { name: 'Ahmed Saeed', email: 'ahmed@almudaqiq.com', role: 'Secretariat', status: 'Active', selected: false },
    { name: 'Omar Adel', email: 'Omar@almudaqiq.com', role: 'Technical Auditor', status: 'Active', selected: false },
    { name: 'Mohamed Saeed', email: 'Mohamed@almudaqiq.com', role: 'Audit Manager', status: 'Inactive', selected: false },
  ];

  // Clients Data (تم إضافة selected)
  clients: Client[] = [
    { name: 'Al Noor Co.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
    { name: 'Green Valley Ltd.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
    { name: 'FutureTech', type: 'Mohamed@almudaqiq.com', status: 'Inactive', selected: false },
    { name: 'FutureTech', type: 'Mohamed@almudaqiq.com', status: 'Inactive', selected: false },
    { name: 'Green Valley Ltd.', type: 'ahmed@almudaqiq.com', status: 'Active', selected: false },
  ];

  // --- Logic for Employees Selection ---
  get isAllEmployeesSelected(): boolean {
    return this.employees.every(e => e.selected);
  }

  toggleAllEmployees() {
    const currentState = this.isAllEmployeesSelected;
    this.employees.forEach(e => e.selected = !currentState);
  }

  toggleEmployee(emp: Employee) {
    emp.selected = !emp.selected;
  }

  // --- Logic for Clients Selection ---
  get isAllClientsSelected(): boolean {
    return this.clients.every(c => c.selected);
  }

  toggleAllClients() {
    const currentState = this.isAllClientsSelected;
    this.clients.forEach(c => c.selected = !currentState);
  }

  toggleClient(client: Client) {
    client.selected = !client.selected;
  }

  // --- Sorting Logic ---
  // نحتفظ بحالة الترتيب الحالية (asc أو desc)
  sortDirection: { [key: string]: 'asc' | 'desc' } = {};

  sortData(listType: 'employees' | 'clients', key: string) {
    const data = listType === 'employees' ? this.employees : this.clients;

    // عكس الاتجاه الحالي أو البدء بـ asc
    const direction = this.sortDirection[key] === 'asc' ? 'desc' : 'asc';
    this.sortDirection[key] = direction;

    data.sort((a: any, b: any) => {
      const valueA = a[key].toLowerCase();
      const valueB = b[key].toLowerCase();

      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
