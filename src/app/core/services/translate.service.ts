import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EN } from '../../features/auth/pages/i18n/en';
import { AR } from '../../features/auth/pages/i18n/ar';

type TranslationKey = keyof typeof EN;

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private langSubject = new BehaviorSubject<'en' | 'ar'>(
    (localStorage.getItem('lang') as 'en' | 'ar') || 'en'
  );

  lang$ = this.langSubject.asObservable(); // للاشتراك في تغييرات اللغة

  get currentLang() {
    return this.langSubject.value;
  }

  private translations: typeof EN = this.currentLang === 'en' ? EN : AR;

  changeLang(lang: 'en' | 'ar') {
    this.langSubject.next(lang);
    localStorage.setItem('lang', lang);
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * دالة ترجمة النصوص
   * @param key مفتاح الترجمة
   * @param vars كائن المتغيرات داخل النصوص (مثلاً: { value: '3.7%' })
   */
  t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let text = this.translations[key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        text = text.replace(`{{${k}}}`, String(vars[k]));
      });
    }
    return text;
  }

  updateTranslations() {
    this.translations = this.currentLang === 'en' ? EN : AR;
  }
}
