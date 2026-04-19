import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { KpiServiceTs } from './kpi.service';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscriber-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriber-home.html',
  styleUrl: './subscriber-home.css',
})
export class SubscriberHome implements OnInit {
  private kpiService = inject(KpiServiceTs);
  private router = inject(Router);
  private lang = inject(TranslateService);

  translations: typeof EN = EN;
  isRtl = false;

  stats: any = null;
  engagementContracts: any[] = [];
  displayedContracts: any[] = [];

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
    this.isRtl = lang === 'ar';
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  ngOnInit(): void {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.loadStats();
    this.loadEngagementContracts();
  }

  loadStats() {
    this.kpiService.getSubscriberStats().subscribe({
      next: (res) => {
        if (res && res.success) {
          this.stats = res.data;
        }
      },
      error: (err) => console.error('Error loading KPI stats', err),
    });
  }

  get complaintsChartStyle() {
    if (!this.stats?.complaints) {
      return {};
    }

    const open = Number(this.stats.complaints.open || 0);
    const closed = Number(this.stats.complaints.closed || 0);
    const total = Number(this.stats.complaints.total || 0);

    if (total === 0) {
      return {
        background: `conic-gradient(#12805c 0deg 360deg)`
      };
    }

    const openPercentage = (open / total) * 100;
    const closedPercentage = (closed / total) * 100;

    return {
      background: `conic-gradient(
        #12805c 0% ${openPercentage}%,
        #38d39f ${openPercentage}% ${openPercentage + closedPercentage}%
      )`
    };
  }

  loadEngagementContracts() {
    this.kpiService.getEngagementContracts().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.engagementContracts = res.data;
          this.displayedContracts = this.engagementContracts.slice(0, 4);
        }
      },
      error: (err) => console.error('Error loading engagement contracts', err),
    });
  }

  goToSubscriberService() {
    this.router.navigate(['/subscriber/subscriber-service']);
  }

  exportDashboard() {
    const element = document.getElementById('dashboardToExport');
    if (!element) return;

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('dashboard.pdf');
    });
  }
}