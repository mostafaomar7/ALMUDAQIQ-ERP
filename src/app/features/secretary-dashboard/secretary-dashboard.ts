import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SecretaryHeader } from './components/secretary-header/secretary-header';
import { SecretarySidebar } from './components/secretary-sidebar/secretary-sidebar';
import { TranslateService } from '../../core/services/translate.service'; // استيراد TranslateService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SecretarySidebar, SecretaryHeader, RouterOutlet],
     templateUrl: './secretary-dashboard.html',
  styleUrl: './secretary-dashboard.css',
})
export class SecretaryDashboard {
  isRtl = false;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.isRtl = this.translate.currentLang === 'ar';

    // الاستماع لتغيرات اللغة
    this.translate.lang$.subscribe(lang => {
      this.isRtl = lang === 'ar';
    });
  }
}
