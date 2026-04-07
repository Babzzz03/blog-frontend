import { useState, useEffect } from 'react';
import { settingsService, SiteSettings } from '@/services/settings.service';

let cache: SiteSettings | null = null;
const listeners: Array<(s: SiteSettings) => void> = [];

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(cache);

  useEffect(() => {
    if (cache) { setSettings(cache); return; }
    settingsService.getSettings().then((s) => {
      cache = s;
      setSettings(s);
      listeners.forEach((fn) => fn(s));
    }).catch(() => {});
    listeners.push(setSettings);
    return () => { const i = listeners.indexOf(setSettings); if (i > -1) listeners.splice(i, 1); };
  }, []);

  // Call this after saving settings to bust the cache
  const invalidate = () => { cache = null; };

  return { settings, invalidate };
}
