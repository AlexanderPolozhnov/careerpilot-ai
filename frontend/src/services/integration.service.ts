import { api } from '@/lib/api-client';

export const integrationService = {
  getGoogleCalendarAuthUrl: () => api.get<{ url: string }>('/integrations/google-calendar/auth-url'),
  disconnectGoogleCalendar: () => api.delete('/integrations/google-calendar'),
};
