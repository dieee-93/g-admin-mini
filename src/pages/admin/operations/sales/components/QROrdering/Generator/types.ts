export interface QRTableConfig {
  tableId: string;
  qrCode: string;
  isActive: boolean;
  expiresAt: string;
  orderCount: number;
  lastUsed?: string;
}
