import { Component, OnInit, ViewChild } from '@angular/core';
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
  selectedParams: any = {}; // متغير جديد للـ API

  subscribers: any[] = [];

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
  // public barChartData: ChartData<'bar'> = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  //   datasets: [{
  //       data: [35000, 26000, 38000, 19000, 26000, 24000, 29000, 35000, 29000, 21000],
  //       backgroundColor: (ctx) => ctx.dataIndex === 4 ? '#007d58' : '#dbe2e8',
  //       borderRadius: 8,
  //       barThickness: 25,
  //       hoverBackgroundColor: '#006644'
  //   }]
  // };

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
      data: [0, 0, 0], // افتراضي صفر لحد ما ييجي البيانات
      backgroundColor: ['#007d58', '#10b981', '#34d399'],
      hoverBackgroundColor: ['#006644', '#059669', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
  }],
};

  constructor(
    private translate: TranslateService,
    private subscriberService: SubscriberService,
    private homeService: HomeService
  ) {}

ngOnInit(): void {
  this.isRtl = this.translate.currentLang === 'ar';
  this.loadTranslations(this.translate.currentLang);

  this.translate.lang$.subscribe(lang => {
    this.isRtl = lang === 'ar';
    this.loadTranslations(lang);
  });

  this.loadSubscribers();
  this.loadSubscribersKpi();
  this.loadFilesKpi();
  this.loadComplaintsKpi();

  // السنين المتاحة
  this.years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  // السنة الافتراضية: السنة الحالية
  this.selectedYear = new Date().getFullYear();
  this.loadProfits('YEAR', this.selectedYear);
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
        error: (err) => console.error('Failed to load subscribers', err)
      });
  }

  loadSubscribersKpi() {
    this.homeService.getSubscribersKpi(this.selectedParams)
      .subscribe({
        next: (res) => {
          this.subscribersKpi = res.data;
        },
        error: (err) => console.error(err)
      });
  }
  complaintsKpi: any = null;
loadComplaintsKpi() {
  this.homeService.getSubscriberscomplaints(this.selectedParams)
    .subscribe({
      next: (res) => {
        if (res && res.data) {
          this.complaintsKpi = res.data;
          this.updateDoughnutChart();

        } else {
          console.warn('No complaints data returned from API');
          // تعيين صفر كقيمة افتراضية عشان الشارت يظهر بدون خطأ
          this.complaintsKpi = { open: 0, closed: 0, pending: 0 };
          this.doughnutChartData.datasets[0].data = [0, 0, 0];
        }

        console.log('Complaints KPI:', this.complaintsKpi);
      },
      error: (err) => {
        console.error('Error fetching complaints KPI:', err);
        // تعيين صفر كقيمة افتراضية لو حصل خطأ
        this.complaintsKpi = { open: 0, closed: 0, pending: 0 };
        this.doughnutChartData.datasets[0].data = [0, 0, 0];
      }
    });
}

// تحديث الدونات ديناميكيًا حسب الـ API
@ViewChild(BaseChartDirective) chart?: BaseChartDirective;

updateDoughnutChart() {
  const data = [
    this.complaintsKpi?.open || 0,
    this.complaintsKpi?.closed || 0,
    this.complaintsKpi?.pending || 0
  ];

  // إنشاء نسخة جديدة للـ datasets
  this.doughnutChartData = {
    labels: ['open', 'closed', 'pending'],
    datasets: [{
      data: data,
      backgroundColor: ['#007d58', '#10b981', '#34d399'],
      hoverBackgroundColor: ['#006644', '#059669', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  // تحديث الشارت
  setTimeout(() => this.chart?.update(), 0);
}


  // عند تغيير تاريخ الـ custom
  onCustomDateChange(event: Event) {
    const from = (event.target as HTMLInputElement).value;
    // لو عايز Range كامل من-to، أضف input ثاني للتاريخ الثاني
    this.applyFilter('custom', { mode: 'custom', from, to: from });
  }

  // دالة مساعدة لتحويل التاريخ لصيغة yyyy-mm-dd
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
applyFilter(mode: 'day' | 'month' | 'year' | 'custom', params: any) {
  this.selectedMode = mode;
  this.selectedParams = params;
  this.loadSubscribersKpi();
  this.loadFilesKpi(); // 🔥 تحديث Files KPI مع كل فلترة
  this.loadComplaintsKpi();
}

selectedMonth: string = new Date().toISOString().slice(0,7); // YYYY-MM
selectedYear: number = new Date().getFullYear(); // YYYY
customFrom: string = this.formatDate(new Date());
customTo: string = this.formatDate(new Date());

// عند تغيير select
onModeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value;

  this.selectedMode = value as any;

  switch(value) {
    case 'day':
      this.selectedDate = this.formatDate(new Date());
      this.applyFilter('day', { mode: 'day', date: this.selectedDate });
      break;

    case 'yesterday':
      const y = new Date();
      y.setDate(y.getDate() - 1);
      this.selectedDate = this.formatDate(y);
      this.applyFilter('day', { mode: 'day', date: this.selectedDate });
      break;

    case 'month':
      this.selectedMonth = new Date().toISOString().slice(0,7);
      this.applyFilter('month', { mode: 'month', year: new Date().getFullYear(), month: new Date().getMonth()+1 });
      break;

    case 'year':
      this.selectedYear = new Date().getFullYear();
      this.applyFilter('year', { mode: 'year', year: this.selectedYear });
      break;

    case 'custom':
      this.customFrom = this.formatDate(new Date());
      this.customTo = this.formatDate(new Date());
      this.applyFilter('custom', { mode: 'custom', from: this.customFrom, to: this.customTo });
      break;
  }
}

// تغييرات الـ day
onDayChange(event: Event) {
  this.selectedDate = (event.target as HTMLInputElement).value;
  this.applyFilter('day', { mode: 'day', date: this.selectedDate });
}

// تغييرات الـ month
onMonthChange(event: Event) {
  this.selectedMonth = (event.target as HTMLInputElement).value;
  const [year, month] = this.selectedMonth.split('-');
  this.applyFilter('month', { mode: 'month', year: +year, month: +month });
}

// تغييرات الـ year
onYearChange(event: Event) {
  this.selectedYear = +(event.target as HTMLInputElement).value;
  this.applyFilter('year', { mode: 'year', year: this.selectedYear });
}

// تغييرات الـ custom
onCustomFromChange(event: Event) {
  this.customFrom = (event.target as HTMLInputElement).value;
  this.applyFilter('custom', { mode: 'custom', from: this.customFrom, to: this.customTo });
}

onCustomToChange(event: Event) {
  this.customTo = (event.target as HTMLInputElement).value;
  this.applyFilter('custom', { mode: 'custom', from: this.customFrom, to: this.customTo });
}
filesKpi: any = null;
loadFilesKpi() {
  this.homeService.getSubscribersFile(this.selectedParams)
    .subscribe({
      next: (res) => {
        this.filesKpi = res.data;
      },
      error: (err) => console.error(err)
    });
}
profitsKpi: any = null;
public barChartData: ChartData<'bar'> = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [{
    data: Array(12).fill(0), // افتراضي صفر لكل الشهور
    backgroundColor: '#007d58',
    borderRadius: 8,
    barThickness: 25,
    hoverBackgroundColor: '#006644'
  }]
};

profitsType: 'YEAR' | 'ALL_YEARS' = 'YEAR';

loadProfits(type: 'YEAR' | 'ALL_YEARS', year?: number) {
  this.profitsType = type;

  const obs$ = type === 'YEAR'
    ? this.homeService.getProfits(year)  // API لكل سنة
    : this.homeService.getProfits(); // API لجميع السنوات

  obs$.subscribe({
    next: (res) => {
      const monthlyData = res.data.monthly || [];
      const data: number[] = Array(12).fill(0);
      monthlyData.forEach((m: { month: number, total: number }) => {
        if (m.month >= 1 && m.month <= 12) data[m.month - 1] = m.total;
      });

      this.barChartData = {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          data,
          backgroundColor: '#007d58',
          borderRadius: 8,
          barThickness: 25,
          hoverBackgroundColor: '#006644'
        }]
      };
    },
    error: (err) => console.error(err)
  });
}

years: number[] = [];
onYearSelect(year: number) {
  this.selectedYear = year;
  this.loadProfits('YEAR', year);
}

}
