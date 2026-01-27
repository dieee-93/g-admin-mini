import type { QRTableConfig } from './types';

export const isExpired = (expiresAt: string) => {
  return new Date(expiresAt) < new Date();
};

export const getQRStatus = (config: QRTableConfig) => {
  if (!config.isActive) return { label: 'Inactive', color: 'gray' };
  if (isExpired(config.expiresAt)) return { label: 'Expired', color: 'red' };
  return { label: 'Active', color: 'green' };
};
