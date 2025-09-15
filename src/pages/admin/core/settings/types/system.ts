// System and notification settings types

export interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alerts: boolean;
  order_notifications: boolean;
  employee_notifications: boolean;
}