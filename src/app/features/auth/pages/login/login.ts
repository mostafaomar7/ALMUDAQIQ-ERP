import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../app/core/services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// استيراد ملفات الترجمة
import { EN } from '../i18n/en';
import { AR } from '../i18n/ar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  currentLang: 'en' | 'ar' = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
  translations: any = {}; // سيتم تخزين الترجمة هنا

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
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
    return this.translations[key];
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;
    this.auth.login(email!, password!)
      .pipe(
        catchError(err => {
          this.error = err?.error?.message || this.t('serverError');
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (res) this.router.navigate(['/dashboard']);
      });
  }
}
