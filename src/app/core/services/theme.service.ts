import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkSubject = new BehaviorSubject<boolean>(false);
  dark$ = this.darkSubject.asObservable();

  constructor() {
    // قراءة حالة الثيم من localStorage لو موجود
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    this.darkSubject.next(savedTheme);
    document.body.classList.toggle('dark-mode', savedTheme);
  }

  toggleTheme() {
    const newTheme = !this.darkSubject.value;
    this.darkSubject.next(newTheme);
    document.body.classList.toggle('dark-mode', newTheme);
    localStorage.setItem('darkMode', String(newTheme));
  }

  isDark() {
    return this.darkSubject.value;
  }
}
