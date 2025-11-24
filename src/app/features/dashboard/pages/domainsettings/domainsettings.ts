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
import { forkJoin, map } from 'rxjs';

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
selectedRegion: any = null;
regionName: string = "";

  // روابط مواقع مهمة
  cpaUrl = '';
  zakatUrl = '';
  commerceUrl = '';
  taxisUrl = '';

  constructor(private langService: TranslateService , private domainService : DomainService) {}
selectCountry(country: any) {
  this.selectedCountry = country;

  // جلب isoCode من مكتبة country-state-city
  const countryObj = Country.getAllCountries().find((c: any) => c.name === country.name);
  this.selectedCountry.isoCode = countryObj?.isoCode;

  // تعيين روابط الدولة
  this.cpaUrl = country.cpaWebsite || '';
  this.zakatUrl = country.taxWebsite || '';
  this.commerceUrl = country.commerceWebsite || '';

  // المدن مع تعداد المناطق
  this.addedCities = country.cities?.map((city: any) => ({
    id: city.id,
    name: city.name,
    regionsCount: city.regions?.length || 0,
    regions: city.regions || []
  })) || [];

  // المناطق للدولة كلها، مع ربط كل منطقة بالمدينة الخاصة بها
  this.regions = this.addedCities
    .map(city => city.regions.map((region:any) => ({
      ...region,
      cityName: city.name
    })))
    .flat();
}

// عند فتح مودال إضافة مدينة
openCityModal(): void {
  if (!this.selectedCountry || !this.selectedCountry.isoCode) {
    Swal.fire('Error', 'Please select a country first', 'error');
    return;
  }

  // جلب الولايات/المقاطعات من المكتبة
  this.states = State.getStatesOfCountry(this.selectedCountry.isoCode);

  this.selectedState = null;
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
openRegionModal(): void {
  if (!this.selectedCountry || !this.selectedCountry.isoCode) {
    Swal.fire('Error', 'Please select a country first', 'error');
    return;
  }

  // جلب المدن للدولة المختارة
  this.cities = City.getCitiesOfCountry(this.selectedCountry.isoCode);
  this.selectedCity = null;

  this.isRegionModalOpen = true;
}
onCitySelectForRegion(event: any) {
  this.selectedCity = event;
}
// حفظ المنطقة
saveRegion() {
  if (!this.selectedCity) {
    Swal.fire('Error', 'Please select a city first', 'error');
    return;
  }

  if (!this.regionName || this.regionName.trim() === "") {
    Swal.fire('Error', 'Please enter a region name', 'error');
    return;
  }

  const regionBody = {
  name: this.selectedCity.name,
  cityId: this.selectedCity.id
};


  this.domainService.addRegion(regionBody).subscribe({
    next: (res: any) => {
      const newRegion = res.region;

      /** 1️⃣ أضف المنطقة داخل المدينة نفسها */
      const cityInUI = this.countriessidebar
        .find(c => c.id === this.selectedCountry.id)
        ?.cities?.find((ct:any) => ct.id === this.selectedCity.id);

      if (cityInUI) {
        cityInUI.regions = cityInUI.regions || [];
        cityInUI.regions.push(newRegion);
      }

      /** 2️⃣ أضفها لقائمة المناطق اللي بتظهر تحت الدولة */
      this.regions.push({
        ...newRegion,
        cityName: this.selectedCity.name
      });

      Swal.fire('Success', 'Region added successfully!', 'success');
      this.regionName = "";
      this.closeRegionModal();
    },
    error: (err) => console.error(err)
  });
}

closeRegionModal() { this.isRegionModalOpen = false; }

  // Load all countries from the library
  loadCountries() {
    this.countries = Country.getAllCountries();
  }

onCountryChange(event: any) {
  this.selectedCountry = JSON.parse(event.target.value);
  this.states = State.getStatesOfCountry(this.selectedCountry.isoCode) || [];
  this.selectedState = null;
  this.cities = [];
  this.selectedCity = null;
  this.regions = [];
}

onStateChange(event: any) {
  this.selectedState = JSON.parse(event.target.value);
  this.cities = City.getCitiesOfState(this.selectedCountry.isoCode, this.selectedState.isoCode) || [];
  this.selectedCity = null;
  this.regions = [];
}

onCityChange(event: any) {
  this.selectedCity = JSON.parse(event.target.value);
  this.selectedRegion = null;
  // إذا عندك بيانات المناطق من API أو من addedCities
  this.regions = this.selectedCity.regions || [];
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
  name: this.selectedState?.name, // state → city
  countryId: countryId
};
    this.domainService.addCity(cityBody).subscribe({
        next: (cityRes: any) => {
    const cityId = Number(cityRes.city?.id);
    if (!cityId) return;

    if (this.selectedCity?.name) {
      const regionBody = {
        name: this.selectedCity.name, // city → region
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
  if (!this.selectedState || !this.selectedCountry?.id) {
    Swal.fire('Error', 'Please select a country and state', 'error');
    return;
  }

  const cityBody = {
    name: this.selectedState.name,
    countryId: this.selectedCountry.id
  };

  this.domainService.addCity(cityBody).subscribe({
    next: (res: any) => {
      const newCity = res.city;

      // ⬅️ إضافة المدينة فوراً في الـ array بدون Refresh
      this.cities.push({
        ...newCity,
        regions: []
      });

      Swal.fire('Success', 'City added successfully!', 'success');

      this.closeCityModal();
    },
    error: (err) => console.error(err)
  });
}

}
