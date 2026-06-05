export function isTelegramWebApp(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).Telegram?.WebApp?.initData;
}

export function getTelegramInitData(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).Telegram?.WebApp?.initData ?? null;
}

export function initTelegramApp(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return;
  
  tg.ready();
  tg.expand();
  
  // Set theme colors if available
  if (tg.themeParams) {
    if (tg.themeParams.bg_color) {
      document.documentElement.style.setProperty('--color-bg', tg.themeParams.bg_color);
    }
  }
}
