import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EN } from '../i18n/en';
import { AR } from '../i18n/ar';

// نوع لجميع مفاتيح الترجمة
export type TranslationKeys = keyof typeof EN;

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
  imports: [RouterModule]
})
export class VerifyEmail {
  currentLang: 'en' | 'ar' = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
  translations: typeof EN = EN;

  email: string = 'daniel.smith@gmail.com'; // مثال، يمكن تغييره حسب الـ API

  constructor() {
    this.loadTranslations(this.currentLang);
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  changeLang(lang: 'en' | 'ar') {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.loadTranslations(lang);
  }

  // دالة ترجمة عامة
  t(key: TranslationKeys) {
    return this.translations[key] || key;
  }

  // إدخال OTP
  onInput(event: Event, nextInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    const value = input.value;
    if (value && nextInput) nextInput.focus();
    if (!/^[0-9]$/.test(value)) input.value = '';
  }

  onKeyDown(event: KeyboardEvent, prevInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;

    if (event.key === 'Backspace' && !input.value && prevInput) {
      prevInput.focus();
    }
  }
}
