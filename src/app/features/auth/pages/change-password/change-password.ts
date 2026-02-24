import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../app/core/services/auth';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css'],
})
export class ChangePassword {
  passwords = { old: '', new: '' };

  showOldPassword = false;
  showNewPassword = false;

  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  toggleOldPassword() { this.showOldPassword = !this.showOldPassword; }
  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }

  onSubmit() {
    this.error = null;
    this.success = null;

    if (!this.passwords.old || !this.passwords.new) {
      this.error = 'Please fill old and new password';
      return;
    }

    this.loading = true;

    this.auth.changePassword(this.passwords.old, this.passwords.new)
      .pipe(
        catchError(err => {
          this.error = err?.error?.message || 'Server error';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;
        if (!res) return;

        this.success = 'Password changed successfully';
localStorage.removeItem('mustChangePassword');
localStorage.removeItem('accessToken');
localStorage.removeItem('country');
localStorage.removeItem('tenant');
localStorage.removeItem('tenant');
localStorage.removeItem('user');

        // بعد التغيير: ودّيه على subscriber dashboard
        this.router.navigate(['/auth/login']);
      });
  }
}
