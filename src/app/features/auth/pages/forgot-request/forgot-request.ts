import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { RouterModule } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// استيراد ملفات الترجمة العامة للـ auth
import { AR } from '../i18n/ar';
import { EN } from '../i18n/en';


@Component({
  selector: 'app-forgot-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-request.html',
  styleUrls: ['./forgot-request.css']
})
export class ForgotRequest implements OnInit {
  form!: FormGroup;
  loading = false;
  successMsg: string | null = null;
  error: string | null = null;

  // اللغة الحالية
  currentLang: 'en' | 'ar' = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
  translations: typeof EN = EN; // ← تعيين افتراضي لتجنب TS2564

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.loadTranslations(this.currentLang);
  }

  // تحميل الترجمة وتغيير اتجاه الصفحة
  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  // تغيير اللغة عند الضغط على الزر
  changeLang(lang: 'en' | 'ar') {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    this.loadTranslations(lang);
  }

  // استرجاع النصوص
  t(key: keyof typeof EN) {
    return this.translations[key] || key;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    this.auth.requestPasswordReset(this.form.value.email!)
      .pipe(catchError(err => {
        this.error = err?.error?.message || this.t('serverError');
        this.loading = false;
        return of(null);
      }))
      .subscribe(res => {
        this.loading = false;
        if (res) {
          this.successMsg = this.t('forgotSuccess');
        }
      });
  }
}
