export interface SubscriberProfileResponse {
  success: boolean;
  data: {
    location: {
      country: string;
      city: string;
      authorityLinks: {
        cpa: string;
        ministry: string;
        tax: string;
      };
    };
    license: {
      type: string;
      number: string;
      date: string; // ISO
      name: string;
    };
    plan: {
      name: string;
      description: string;
      subscriptionStart: string;
      subscriptionEnd: string;
      paidFees: number | null;
      status: 'ACTIVE' | 'INACTIVE' | string;
      usage: {
        subscription: {
          startDate: string;
          endDate: string;
          remainingDays: number;
        };
        users: { used: number; limit: number; remaining: number; percentage: number };
        branches: { used: number; limit: number; remaining: number; percentage: number };
        clients: { used: number; limit: number; remaining: number; percentage: number };
        storage: { usedMB: number; limitMB: number; remainingMB: number; percentage: number };
      };
    };
  };
}
