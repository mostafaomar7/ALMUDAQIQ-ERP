import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuditHeader } from './components/audit-header/audit-header';
import { AuditSidebar } from './components/audit-sidebar/audit-sidebar';
import { TranslateService } from '../../core/services/translate.service'; // استيراد TranslateService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AuditSidebar, AuditHeader, RouterOutlet],
  templateUrl: './auditmanager-dashboard.html',
  styleUrl: './auditmanager-dashboard.css',
})
export class AuditmanagerDashboard {
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
