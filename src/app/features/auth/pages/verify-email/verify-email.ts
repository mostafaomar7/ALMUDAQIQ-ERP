import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { EN } from '../i18n/en';
import { AR } from '../i18n/ar';
import { AuthService } from '../../../../core/services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export type TranslationKeys = keyof typeof EN;

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css'],
  imports: []
})
export class VerifyEmail {
  currentLang: 'en' | 'ar' = (localStorage.getItem('lang') as 'en' | 'ar') || 'en';
  translations: typeof EN = EN;

  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  email: string = 'admin@erp.com'; // يمكن تحديثها من السيرفر أو الاستقبال من السابق

  // الحقول الستة للـ OTP
  @ViewChild('otp1') otp1!: ElementRef<HTMLInputElement>;
  @ViewChild('otp2') otp2!: ElementRef<HTMLInputElement>;
  @ViewChild('otp3') otp3!: ElementRef<HTMLInputElement>;
  @ViewChild('otp4') otp4!: ElementRef<HTMLInputElement>;
  @ViewChild('otp5') otp5!: ElementRef<HTMLInputElement>;
  @ViewChild('otp6') otp6!: ElementRef<HTMLInputElement>;

  constructor(private auth: AuthService, private router: Router) {
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

  t(key: TranslationKeys) {
    return this.translations[key] || key;
  }

  onInput(event: Event, nextInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (!/^[0-9]$/.test(input.value)) input.value = '';
    else if (nextInput) nextInput.focus();
  }

  onKeyDown(event: KeyboardEvent, prevInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && prevInput) {
      prevInput.focus();
    }
  }

  getOTP(): string {
    return (
      this.otp1.nativeElement.value +
      this.otp2.nativeElement.value +
      this.otp3.nativeElement.value +
      this.otp4.nativeElement.value +
      this.otp5.nativeElement.value +
      this.otp6.nativeElement.value
    );
  }

verify() {
  const token = this.getOTP();
  if (token.length < 6) {
    this.error = 'Please enter the complete OTP.';
    return;
  }

  this.loading = true;
  this.error = null;

  this.auth.verifyEmailWithEmail(this.email, token)
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
        this.successMsg = 'Email verified successfully!';
        // تحويل المستخدم مع إرسال OTP كـ query param
        this.router.navigate(['/auth/reset-password'], { queryParams: { otp: token } });
      }
    });
}

}
