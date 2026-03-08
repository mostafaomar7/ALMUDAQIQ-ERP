import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeretaryEngagementContractService } from '../secretary-engagement-contract/seretary-engagement-contract.service';

@Component({
  selector: 'app-secretary-engagement-contract-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secretary-engagement-contract-details.html',
  styleUrl: './secretary-engagement-contract-details.css'
})
export class SecretaryEngagementContractDetailsComponent implements OnInit {
  contractId: string | null = null;
  contract: any = null;
  loading = true;

  // ⚠️ هام: ضع هنا رابط السيرفر الخاص بك الذي يعرض الملفات
  // مثال: إذا كان السيرفر يعمل على بورت 3000
  serverBaseUrl = 'http://192.168.1.54:4000/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractsApi: SeretaryEngagementContractService
  ) {}

  ngOnInit() {
    this.contractId = this.route.snapshot.paramMap.get('id');
    if (this.contractId) {
      this.fetchContractDetails(this.contractId);
    }
  }

  fetchContractDetails(id: string) {
    this.loading = true;
    this.contractsApi.getContractById(id).subscribe({
      next: (res) => {
        this.contract = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching details:', err);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  // --- دوال التعامل مع الملفات ---

  // 1. استخراج اسم الملف فقط للعرض
  getFileName(path: string | null): string {
    if (!path) return 'No File';
    // يحذف كل ما قبل آخر علامة / أو \
    return path.replace(/^.*[\\\/]/, '');
  }

  // 2. تحويل المسار المحلي (D:\...) إلى رابط سيرفر (http://...)
getFileUrl(path: string | null): string {
    if (!path) return '';

    // البحث عن كلمة 'uploads' (تحويل المسار للتوافق مع الويب)
    const index = path.toLowerCase().indexOf('uploads');

    if (index !== -1) {
      // 1. استخراج المسار النسبي: uploads\contracts\file.pdf
      let relativePath = path.substring(index);

      // 2. استبدال كل \ بـ /
      relativePath = relativePath.replace(/\\/g, '/');

      // 3. التأكد من عدم وجود / في بداية المسار النسبي لأننا وضعناها في serverBaseUrl
      if (relativePath.startsWith('/')) {
        relativePath = relativePath.substring(1);
      }

      const fullUrl = this.serverBaseUrl + relativePath;

      // هام: طباعة الرابط في الكونسول للتأكد من صحته
      console.log('Generated URL:', fullUrl);

      return fullUrl;
    }

    // في حالة عدم العثور على uploads (أو مسار غير متوقع)
    return path;
  }

  // 3. زر العرض (العين)
  viewFile(path: string | null) {
    const url = this.getFileUrl(path);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('File path not valid');
    }
  }

  // 4. زر التحميل (السهم)
  downloadFile(path: string | null) {
    const url = this.getFileUrl(path);
    const fileName = this.getFileName(path);

    if (url) {
      // إنشاء رابط وهمي والضغط عليه لبدء التحميل
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank'; // أحياناً مطلوب لتجاوز مانع النوافذ المنبثقة
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
