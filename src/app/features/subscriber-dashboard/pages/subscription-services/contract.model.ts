// contract.model.ts
export interface Contract {
  id: string;
  contractNumber: string;
  customerName: string; // يمثل Establishment Name
  engagementContractDate: string;
  legalEntity: string;
  commercialRegisterNumber: string;
  taxNumber: string;
  unifiedNumber: string;
  status: string; // 'ACTIVE' | 'INACTIVE'
  // يمكنك إضافة باقي الحقول هنا حسب الحاجة
}

export interface ApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
