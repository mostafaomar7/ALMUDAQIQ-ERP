import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { Country, State, City } from 'country-state-city';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-domainsettings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domainsettings.html',
  styleUrls: ['./domainsettings.css'],
})
export class Domainsettings implements OnInit {

  translations: typeof EN = EN;

  // التحكم في النوافذ
  isModalOpen = false;
  isCityModalOpen = false;
  isRegionModalOpen = false;

  // Dropdowns
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  regions: any[] = []; // Regions هنا تمثل المناطق داخل المدن إذا أردت لاحقًا

  selectedCountry: any = null;
  selectedState: any = null;
  selectedCity: any = null;

  // روابط مواقع مهمة
  cpaUrl = 'https://socpa.org.sa';
  zakatUrl = 'https://zatca.gov.sa';
  commerceUrl = 'https://mc.gov.sa';
  taxisUrl = 'https://taxis.gov.sa';

  constructor(private langService: TranslateService) {}
selectCountry(country: any) {
  this.selectedCountry = country;
  this.states = State.getStatesOfCountry(country.isoCode);
  this.selectedState = null;
  this.cities = [];
  this.selectedCity = null;
}

  ngOnInit(): void {
    this.langService.lang$.subscribe(lang => this.loadTranslations(lang));
    this.loadCountries();
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  // Modal controls
  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
  openCityModal() { this.isCityModalOpen = true; }
  closeCityModal() { this.isCityModalOpen = false; }
  openRegionModal() { this.isRegionModalOpen = true; }
  closeRegionModal() { this.isRegionModalOpen = false; }

  // Load all countries from the library
  loadCountries() {
    this.countries = Country.getAllCountries();
  }

  // When user selects a country
  onCountryChange(event: any) {
    this.selectedCountry = JSON.parse(event.target.value);
    this.states = State.getStatesOfCountry(this.selectedCountry.isoCode);
    this.selectedState = null;
    this.cities = [];
    this.selectedCity = null;
  }

  // When user selects a state
  onStateChange(event: any) {
    this.selectedState = JSON.parse(event.target.value);
    this.cities = City.getCitiesOfState(this.selectedCountry.isoCode, this.selectedState.isoCode);
    this.selectedCity = null;
  }

  // When user selects a city
  onCityChange(event: any) {
    this.selectedCity = JSON.parse(event.target.value);
  }

  clear(type: string) {
    switch(type) {
      case 'country':
        this.selectedCountry = this.selectedState = this.selectedCity = null;
        this.states = this.cities = [];
        break;
      case 'state':
        this.selectedState = this.selectedCity = null;
        this.cities = [];
        break;
      case 'city':
        this.selectedCity = null;
        break;
    }
  }

}
