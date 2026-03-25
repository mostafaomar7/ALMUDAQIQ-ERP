import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common'; // استدعاء CommonModule و DatePipe
import { Ticket } from './ticket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-ticket',
  standalone: true,
  imports: [FormsModule, CommonModule], // ضفنا CommonModule
  providers: [DatePipe], // عشان نظبط شكل التاريخ
  templateUrl: './subscription-ticket.html',
  styleUrl: './subscription-ticket.css',
})
export class SubscriptionTicket implements OnInit {
  phone = '';
  type = '';
  message = '';
  user: any;

  // متغير لتخزين التيكتات
  myTickets: any[] = [];

  constructor(private ticketService: Ticket, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loadMyTickets(); // استدعاء جلب التيكتات أول ما الصفحة تفتح
  }

  // دالة لجلب التيكتات من الـ API
  loadMyTickets() {
    this.ticketService.getMyTickets().subscribe({
      next: (res) => {
        // الرد جاي جواه property اسمها data
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
          title: 'Success',
          text: res?.message || 'Ticket sent successfully',
          confirmButtonText: 'OK',
        });

        this.resetForm();
        this.loadMyTickets(); // تحديث الجدول بعد إضافة تيكت جديدة
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.error?.message || 'Something went wrong',
          confirmButtonText: 'Try again',
        });
      },
    });
  }

  resetForm() {
    this.phone = '';
    this.type = '';
    this.message = '';
  }

  // دالة مساعدة لتحديد شكل ولون الـ Badge بناءً على الرد
  getStatus(ticket: any): { label: string, class: string } {
    // لو فيه response و respondedAt يبقي اتحلت، لو مفيش يبقي Open
    if (ticket.response && ticket.respondedAt) {
      return { label: 'Resolved', class: 'badge-resolved' };
    }
    return { label: 'Open', class: 'badge-open' };
  }
}
