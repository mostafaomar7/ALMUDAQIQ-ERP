// core/services/tenant.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {

  private readonly storageKey = 'tenant';

  /**
   * استخراج tenant من hostname
   * أمثلة:
   * twst.localhost       => twst
   * mostafa.mudqiq.com   => mostafa
   * www.mostafa.mudqiq.com => mostafa
   */
  getTenantFromHost(hostname: string = window.location.hostname): string | null {
    if (!hostname) return null;

    const host = hostname.toLowerCase().trim();
    const parts = host.split('.').filter(Boolean);

    // -------------------------
    // ✅ LOCAL DEVELOPMENT
    // -------------------------
    // twst.localhost
    if (host.endsWith('.localhost') && parts.length >= 2) {
      return parts[0]; // twst
    }

    // localhost فقط
    if (host === 'localhost' || host === '127.0.0.1') {
      return null;
    }

    // -------------------------
    // ✅ PRODUCTION DOMAIN
    // -------------------------
    // أقل حاجة: x.domain.tld
    if (parts.length < 3) return null;

    // www.mostafa.mudqiq.com
    if (parts[0] === 'www') {
      return parts[1] || null;
    }

    // mostafa.mudqiq.com
    return parts[0] || null;
  }

  /**
   * tenant من URL الحالي
   */
  getTenantFromUrl(): string | null {
    return this.getTenantFromHost(window.location.hostname);
  }

  /**
   * تخزين tenant
   */
  setStoredTenant(tenant: string | null): void {
    if (tenant) localStorage.setItem(this.storageKey, tenant);
    else localStorage.removeItem(this.storageKey);
  }

  /**
   * قراءة tenant من storage
   */
  getStoredTenant(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  /**
   * هل الدومين root بدون tenant؟
   */
  isRootDomain(hostname: string = window.location.hostname): boolean {
    const host = hostname.toLowerCase().trim();
    const parts = host.split('.').filter(Boolean);

    if (host === 'localhost' || host === '127.0.0.1') return true;

    if (parts.length === 2) return true;
    if (parts.length === 3 && parts[0] === 'www') return true;

    return false;
  }
}
