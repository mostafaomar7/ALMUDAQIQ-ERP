// core/services/tenant.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  getTenantFromHost(hostname: string = window.location.hostname): string | null {
    // hostname examples:
    // mostafa.muqiq.com
    // www.mostafa.muqiq.com

    const parts = hostname.split('.').filter(Boolean);

    // أقل حاجة: x.domain.tld => 3 أجزاء
    if (parts.length < 3) return null;

    // لو فيه www في الأول: www.mostafa.muqiq.com
    if (parts[0].toLowerCase() === 'www') {
      return parts[1] || null;
    }

    // mostafa.muqiq.com
    return parts[0] || null;
  }

  isRootDomain(hostname: string = window.location.hostname): boolean {
    // muqiq.com أو www.muqiq.com => مفيش tenant
    const parts = hostname.split('.').filter(Boolean);
    if (parts.length === 2) return true;
    if (parts.length === 3 && parts[0].toLowerCase() === 'www') return true;
    return false;
  }
}
