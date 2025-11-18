import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

Chart.register(...registerables);

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BaseChartDirective , RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  userName = 'khalil';
  translations: typeof EN = EN;
  isRtl = false;

  subscribers = [
    { name: 'Ahmed Ali', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' },
    { name: 'Youssef Hassan', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' },
    { name: 'Omar Khaled', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' },
    { name: 'Mona Ibrahim', email: 'AhmedAli@gmail.com', mobile: '+966 54 123 4567', country: 'Saudi Arabia', city: 'Makkah Region', region: 'Jeddah' },
  ];

  // --- Bar Chart ---
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { display: true, grid: { color: '#f0f0f0' }, border: { display: false }, ticks: { stepSize: 10000 } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: () => 'May 2024',
          label: (context) => `$${context.raw}`
        }
      }
    }
  };
  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [{
        data: [35000, 26000, 38000, 19000, 26000, 24000, 29000, 35000, 29000, 21000],
        backgroundColor: (ctx) => ctx.dataIndex === 4 ? '#007d58' : '#dbe2e8',
        borderRadius: 8,
        barThickness: 25,
        hoverBackgroundColor: '#006644'
    }]
  };

  // --- Doughnut Chart ---
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };
  public doughnutChartType: 'doughnut' = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['open', 'closed', 'pending'],
    datasets: [{
        data: [40, 25, 35],
        backgroundColor: ['#007d58', '#10b981', '#34d399'],
        hoverBackgroundColor: ['#006644', '#059669', '#10b981'],
        borderWidth: 0,
        hoverOffset: 4
    }],
  };

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.isRtl = this.translate.currentLang === 'ar';
    this.loadTranslations(this.translate.currentLang);

    this.translate.lang$.subscribe(lang => {
      this.isRtl = lang === 'ar';
      this.loadTranslations(lang);
    });
  }

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey, vars?: Record<string, string | number>): string {
    let text = this.translations[key] || key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        text = text.replace(`{{${k}}}`, String(vars[k]));
      });
    }
    return text;
  }
}
