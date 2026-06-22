import { api } from '@/lib/api-client';

export interface HhPreviewData {
  name?: string;
  location?: string;
  skills?: string[];
  yearsOfExperience?: number;
  headline?: string;
}

export interface HhAuthUrlResponse {
  url: string;
}

export interface HhStatusResponse {
  connected: boolean;
}

export interface StarsPaymentResponse {
  paymentId: string;
  deepLink: string;
}

export const integrationService = {
  // ─── Google Calendar ─────────────────────────────────────────────────────
  getGoogleCalendarAuthUrl: () => api.get<{ url: string }>('/integrations/google-calendar/auth-url'),
  disconnectGoogleCalendar: () => api.delete('/integrations/google-calendar'),

  // ─── hh.ru Integration ───────────────────────────────────────────────────
  /** Получить URL для OAuth2-авторизации через hh.ru */
  getHhAuthUrl: (): Promise<HhAuthUrlResponse> =>
    api.get<HhAuthUrlResponse>('/integration/hh/auth-url'),

  /** Проверить статус подключения hh.ru */
  getHhStatus: (): Promise<HhStatusResponse> =>
    api.get<HhStatusResponse>('/integration/hh/status'),

  /** Получить данные резюме с hh.ru для предпросмотра */
  getHhPreview: (): Promise<HhPreviewData> =>
    api.get<HhPreviewData>('/integration/hh/preview'),

  /** Синхронизировать выбранные поля из hh.ru в профиль */
  syncHhProfile: (fields: string[]): Promise<void> =>
    api.post<void>('/integration/hh/sync', { fields }),

  /** Отключить интеграцию hh.ru */
  disconnectHh: (): Promise<void> =>
    api.delete('/integration/hh'),

  // ─── Telegram Stars Payments ─────────────────────────────────────────────
  /** Инициировать оплату через Telegram Stars, получить deep-link */
  initiateStarsPayment: (plan: string, durationMonths: number): Promise<StarsPaymentResponse> =>
    api.post<StarsPaymentResponse>('/payments/stars/initiate', { plan, durationMonths }),

  /** Проверить статус платежа Stars */
  getStarsPaymentStatus: (paymentId: string): Promise<{ paymentId: string; status: string }> =>
    api.get<{ paymentId: string; status: string }>(`/payments/stars/${paymentId}/status`),

  /** Получить ссылку на оплату Stars */
  getStarsInvoiceLink: (paymentId: string): Promise<{ invoiceLink: string }> =>
    api.get<{ invoiceLink: string }>(`/payments/stars/${paymentId}/invoice`),
};
