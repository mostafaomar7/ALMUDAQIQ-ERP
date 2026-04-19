import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

import { Ticket } from './ticket.service';
import { TranslateService } from '../../../../core/services/translate.service';
import { EN } from './i18n/en';
import { AR } from './i18n/ar';

type TranslationKey = keyof typeof EN;

@Component({
  selector: 'app-subscription-ticket',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './subscription-ticket.html',
  styleUrl: './subscription-ticket.css',
})
export class SubscriptionTicket implements OnInit {
  translations: typeof EN = EN;

  phone = '';
  type = '';
  message = '';
  user: any;
  myTickets: any[] = [];

  constructor(
    private ticketService: Ticket,
    private datePipe: DatePipe,
    private lang: TranslateService
  ) {}

  loadTranslations(lang: 'en' | 'ar') {
    this.translations = lang === 'en' ? EN : AR;
  }

  t(key: TranslationKey): string {
    return this.translations[key] || key;
  }

  ngOnInit(): void {
    this.lang.lang$.subscribe((l) => this.loadTranslations(l));
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadMyTickets();
  }

  loadMyTickets() {
    this.ticketService.getMyTickets().subscribe({
      next: (res) => {
        this.myTickets = res.data || [];
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
      }
    });
  }

  submit() {
    const body = {
      subscriberId: this.user?.subscriberId,
      subscriberName: this.user?.fullName,
      email: this.user?.email,
      phone: this.phone,
      message: this.message,
      type: this.type?.toUpperCase(),
    };

    this.ticketService.createComplaint(body).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: this.t('success'),
          text: res?.message || this.t('ticketSentSuccessfully'),
          confirmButtonText: this.t('ok'),
        });

        this.resetForm();
        this.loadMyTickets();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: this.t('error'),
          text: err?.error?.message || this.t('somethingWentWrong'),
          confirmButtonText: this.t('tryAgain'),
        });
      },
    });
  }

  resetForm() {
    this.phone = '';
    this.type = '';
    this.message = '';
  }

  getStatus(ticket: any): { label: string; class: string } {
    if (ticket.response && ticket.respondedAt) {
      return { label: this.t('resolved'), class: 'badge-resolved' };
    }
    return { label: this.t('open'), class: 'badge-open' };
  }

  getCategoryLabel(type: string): string {
    const normalized = (type || '').toLowerCase();

    if (normalized === 'technical') return this.t('technical');
    if (normalized === 'commerce') return this.t('commerce');

    return type || '-';
  }
}