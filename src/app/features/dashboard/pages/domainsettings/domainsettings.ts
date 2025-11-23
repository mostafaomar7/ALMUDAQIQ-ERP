import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { Country, State, City } from 'country-state-city';
import { HttpClientModule } from '@angular/common/http';
import { DomainService } from './domain.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-domainsettings',
  standalone: true,
imports: [CommonModule, FormsModule, HttpClientModule , SweetAlert2Module],
  templateUrl: './domainsettings.html',
  styleUrls: ['./domainsettings.css'],
})

export class Domainsettings implements OnInit {

  translations: typeof EN = EN;
  countriessidebar : any[] = [];
  // التحكم في النوافذ
  isModalOpen = false;
  isCityModalOpen = false;
  isRegionModalOpen = false;

  // Dropdowns
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  regions: any[] = []; // Regions هنا تمثل المناطق داخل المدن إذا أردت لاحقًا
  addedCities: any[] = [];
  availableCities: any[] = [];
  selectedCountry: any = null;
  selectedState: any = null;
  selectedCity: any = null;

  // روابط مواقع مهمة
  cpaUrl = '';
  zakatUrl = '';
  commerceUrl = '';
  taxisUrl = '';

  constructor(private langService: TranslateService , private domainService : DomainService) {}
selectCountry(country: any) {
  this.selectedCountry = country;

  // حفظ isoCode لاستخدامه في المودال فقط
  const countryObj = Country.getAllCountries().find((c: any) => c.name === country.name);
  this.selectedCountry.isoCode = countryObj?.isoCode || null;

  // روابط المواقع
  this.cpaUrl = country.cpaWebsite || '';
  this.commerceUrl = country.commerceWebsite || '';
  this.zakatUrl = country.taxWebsite || '';

  // إعادة تعيين القوائم القديمة
  this.addedCities = [];
  this.regions = [];
  this.selectedCity = null;

  // جلب المدن الخاصة بالدولة من API فقط للجدول
  if (this.selectedCountry.id) {
    this.domainService.getCitiesByCountry(this.selectedCountry.id).subscribe(citiesRes => {
      // تحديث addedCities فقط بالمدن الخاصة بالدولة
      this.addedCities = citiesRes.map(city => ({
        ...city,
        regionsCount: 0
      }));

      // مسح المناطق القديمة قبل إضافة أي بيانات جديدة
      this.regions = [];

      // جلب المناطق لكل مدينة
      const regionRequests = this.addedCities.map(city =>
        this.domainService.getRegionsByCity(city.id).pipe(
          // عند الاستلام، أضف فقط المناطق التي تنتمي لهذه المدينة
          // استخدم map أو subscribe لاحقًا
        )
      );

      // اشتغل على كل المناطق لكل مدينة
      this.addedCities.forEach(city => {
        this.domainService.getRegionsByCity(city.id).subscribe(regionsRes => {
          const cityRegions = regionsRes.map(r => ({ ...r, cityName: city.name }));
          this.regions.push(...cityRegions);
          city.regionsCount = cityRegions.length;
        });
      });
    });
  }

  // الـ select في المودال سيعبأ عند فتح المودال
  this.cities = [];
}


// عند فتح مودال إضافة مدينة
openCityModal(): void {
  if (!this.selectedCountry?.isoCode) {
    Swal.fire('Error', 'Please select a country first', 'error');
    return;
  }

  // هذا للـ select في المودال فقط
  this.cities = City.getCitiesOfCountry(this.selectedCountry.isoCode);

  this.selectedCity = null;
  this.isCityModalOpen = true;
}



  ngOnInit(): void {
    this.langService.lang$.subscribe(lang => this.loadTranslations(lang));
    this.loadCountries();
    this.loadCountriesFromAPI();
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
saveAll() {
  if (!this.selectedCountry) {
    Swal.fire('Error', 'Please select a country', 'error');
    return;
  }
  if (!this.selectedCity?.name) {
    Swal.fire('Error', 'Please select a city', 'error');
    return;
  }

  const countryBody = {
    name: this.selectedCountry.name,
    cpaWebsite: this.cpaUrl,
    commerceWebsite: this.commerceUrl,
    taxWebsite: this.zakatUrl
  };

this.domainService.addCountry(countryBody).subscribe({
  next: (countryRes: any) => {
    const countryId = Number(countryRes.country?.id);
    if (!countryId) return console.error('Country ID missing');

    // ← أضف الدولة مباشرة للـ sidebar
    this.countriessidebar.push(countryRes.country);

    const cityBody = {
      name: this.selectedCity.name,
      countryId: countryId
    };

    this.domainService.addCity(cityBody).subscribe({
      next: (cityRes: any) => {
        const cityId = Number(cityRes.city?.id);
        if (!cityId) return console.error('City ID missing');

        if (this.selectedState?.name) {
          const regionBody = {
            name: this.selectedState.name,
            cityId: cityId
          };
          this.domainService.addRegion(regionBody).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Country + City + Region added successfully!',
                timer: 2000,
                showConfirmButton: false
              });
              this.closeModal();
            }
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Country + City added successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeModal();
        }
      }
    });
  }
});

}
loadCountriesFromAPI() {
  this.domainService.getCountries().subscribe({
    next: (res: any) => {
      this.countriessidebar = res; // assuming API returns array of countries
      console.log('Countries loaded:', this.countriessidebar);
    },
    error: (err) => {
      console.error('Error loading countries', err);
    }
  });
}
saveCity(): void {
  if (!this.selectedCity || !this.selectedCountry?.id) {
    Swal.fire('Error', 'Please select a country and city', 'error');
    return;
  }

  const cityBody = {
    name: this.selectedCity.name,
    countryId: this.selectedCountry.id
  };

  this.domainService.addCity(cityBody).subscribe({
    next: (res: any) => {
      Swal.fire('Success', 'City added successfully!', 'success');
      // إعادة تحميل المدن المضافة للجدول بعد الحفظ
      this.selectCountry(this.selectedCountry);
      this.closeCityModal();
    },
    error: (err) => console.error(err)
  });
}


}
