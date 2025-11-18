import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';
import { Header } from './components/header/header';
import { TranslateService } from '../../core/services/translate.service'; // استيراد TranslateService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, Header, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
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
