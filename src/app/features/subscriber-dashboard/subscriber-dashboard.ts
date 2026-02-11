import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SubscriberSidebar } from './components/subscriber-sidebar/subscriber-sidebar';
import { SubscriberHeader } from './components/subscriber-header/subscriber-header';
import { TranslateService } from '../../core/services/translate.service'; // استيراد TranslateService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SubscriberSidebar, SubscriberHeader, RouterOutlet],
    templateUrl: './subscriber-dashboard.html',
  styleUrl: './subscriber-dashboard.css',
})
export class SubscriberDashboard{ 
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
