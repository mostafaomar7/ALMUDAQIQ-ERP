import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface City {
  id: number;
  name: string;
  regionsCount: number;
}

interface Region {
  id: number;
  name: string;
  cityName: string;
}

@Component({
  selector: 'app-domainsettings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domainsettings.html',
  styleUrls: ['./domainsettings.css'],
})
export class Domainsettings {
  // التحكم في النوافذ المنبثقة
  isModalOpen: boolean = false;       // Add Country Modal
  isCityModalOpen: boolean = false;   // Add City Modal
  isRegionModalOpen: boolean = false; // Add Region Modal (جديد)

  // الدولة المختارة حالياً
  selectedCountry: string = 'Saudi Arabia';

  // قائمة الدول
  countries: string[] = [
    'Saudi Arabia',
    'United Arab Emirates',
    'Egypt',
    'kuwait'
  ];

  // بيانات الحقول (URLs)
  cpaUrl: string = 'CPA: https://socpa.org.sa';
  zakatUrl: string = 'https://zatca.gov.sa';
  commerceUrl: string = 'https://mc.gov.sa';
  taxisUrl: string = 'https://taxis.gov.sa';

  cities: City[] = [
    { id: 1, name: 'Riyadh', regionsCount: 2 },
    { id: 2, name: 'Riyadh', regionsCount: 3 },
  ];

  regions: Region[] = [
    { id: 1, name: 'Al Olaya', cityName: 'Riyadh' },
    { id: 2, name: 'Dammam', cityName: 'Riyadh' },
  ];

  selectCountry(country: string) {
    this.selectedCountry = country;
  }

  // --- Add Country Modal Actions ---
  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // --- Add City Modal Actions ---
  openCityModal() {
    this.isCityModalOpen = true;
  }

  closeCityModal() {
    this.isCityModalOpen = false;
  }

  // --- Add Region Modal Actions (جديد) ---
  openRegionModal() {
    this.isRegionModalOpen = true;
  }

  closeRegionModal() {
    this.isRegionModalOpen = false;
  }
}
