'use client';

import { useEffect } from 'react';
import '@/i18n/config';

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ensure direction is set on mount based on stored language
    const stored = localStorage.getItem('i18n_lang');
    if (stored === 'ar') {
      document.documentElement.dir = 'rtl';
    }
  }, []);

  return <>{children}</>;
}
