import { api } from '@/lib/api-client';

export interface StarsPaymentResponse {
  paymentId: string;
  deepLink: string;
}

export const integrationService = {
  // ─── Google Calendar ─────────────────────────────────────────────────────
  getGoogleCalendarAuthUrl: () => api.get<{ url: string }>('/integrations/google-calendar/auth-url'),
  disconnectGoogleCalendar: () => api.delete('/integrations/google-calendar'),

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

