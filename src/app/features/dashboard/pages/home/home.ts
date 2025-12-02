import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';
import { Subscribers } from '../subscribers/subscribers';
import { SubscriberService } from '../subscribers/subscriber.service';
import { HomeService } from './home.service';

Chart.register(...registerables);

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BaseChartDirective , RouterLink ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  userName = 'khalil';
  translations: typeof EN = EN;
  isRtl = false;
  subscribersKpi: any = null; // لحفظ الـ KPI
  selectedMode: 'day' | 'month' | 'year' | 'custom' = 'day';
  selectedDate: string = new Date().toISOString().split('T')[0]; // اليوم الحالي بصيغة yyyy-mm-dd

  subscribers :any[] = [];

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

  constructor(private translate: TranslateService ,
     private subscriberService : SubscriberService ,
    private homeService: HomeService ) {}

  ngOnInit(): void {
    this.isRtl = this.translate.currentLang === 'ar';
    this.loadTranslations(this.translate.currentLang);

    this.translate.lang$.subscribe(lang => {
      this.isRtl = lang === 'ar';
      this.loadTranslations(lang);
    });
    this.loadSubscribers();
    this.loadSubscribersKpi();
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
loadSubscribers() {
  this.subscriberService.getSubscribers(1, 10)
    .subscribe({
      next: (res) => {
        this.subscribers = (res.data || []).slice(0, 3); // أول 3 فقط
      },
      error: (err) => {
        console.error('Failed to load subscribers', err);
      }
    });
}
loadSubscribersKpi() {
    this.homeService.getSubscribersKpi(this.selectedMode, this.selectedDate)
      .subscribe({
        next: (res) => {
          this.subscribersKpi = res.data;
          console.log('KPI Data:', this.subscribersKpi);
        },
        error: (err) => console.error('Failed to load KPI', err)
      });
  }

  // عند تغيير الفلتر
  onFilterChange(mode: 'day' | 'month' | 'year' | 'custom', date?: string) {
    this.selectedMode = mode;
    if (date) this.selectedDate = date;
    this.loadSubscribersKpi();
  }
  // عند تغيير الـ select
// عند تغيير الـ select
onModeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  const today = new Date();
  let startDate = today;
  let endDate = today;

  switch (value) {
    case 'today':
      this.onFilterChange('day', this.formatDate(today));
      break;
    case 'yesterday':
      startDate = new Date();
      startDate.setDate(today.getDate() - 1);
      this.onFilterChange('day', this.formatDate(startDate));
      break;
    case 'week':
      startDate = new Date();
      startDate.setDate(today.getDate() - 6);
      this.onFilterChange('custom', `${this.formatDate(startDate)},${this.formatDate(today)}`);
      break;
    case 'month':
      startDate = new Date();
      startDate.setDate(today.getDate() - 29);
      this.onFilterChange('custom', `${this.formatDate(startDate)},${this.formatDate(today)}`);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(today.getFullYear() - 1);
      this.onFilterChange('custom', `${this.formatDate(startDate)},${this.formatDate(today)}`);
      break;
    case 'custom':
      this.onFilterChange('custom', this.selectedDate);
      break;
  }
}

// دالة مساعدة لتحويل التاريخ لصيغة yyyy-mm-dd
formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// عند تغيير تاريخ الـ custom
onCustomDateChange(event: Event) {
  const date = (event.target as HTMLInputElement).value;
  this.onFilterChange('custom', date);
}


}

