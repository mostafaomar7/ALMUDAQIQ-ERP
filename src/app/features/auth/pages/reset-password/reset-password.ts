import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../../app/core/services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// استيراد ملفات الترجمة
import { EN } from '../i18n/en';
import { AR } from '../i18n/ar';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  currentLang: 'en' | 'ar' = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
  translations: typeof EN = EN;

  email = 'admin@erp.com'; // الايميل ثابت
  otp: string | null = null; // ممكن تجي من query param

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // قراءة OTP من query param
    this.otp = this.route.snapshot.queryParamMap.get('otp');

    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

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

  t(key: keyof typeof EN) {
    return this.translations[key] || key;
  }

  submit() {
    if (!this.otp) {
      this.error = 'OTP not found!';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.error = this.t('passwordMismatch');
      return;
    }

    this.loading = true;
    this.error = null;

    const newPassword = this.form.value.password;

    // استدعاء API إعادة تعيين كلمة المرور
    this.auth.resetPassword(this.email, this.otp, newPassword)
      .pipe(
        catchError(err => {
          this.error = err?.error?.message || this.t('serverError');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (res) {
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
