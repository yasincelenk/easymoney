let enabled = false;

export function configureAnalytics(flag: boolean) {
  enabled = flag;
}

export function track(event: string, payload?: Record<string, unknown>) {
  if (!enabled) return;
  console.debug('[analytics]', event, payload);
}
