'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsService } from '@/services/settings.service';

export interface ThemeColor {
  name: string;
  label: string;
  hsl: string;       // e.g. "24.6 95% 53.1%"
  hslDark: string;   // dark mode variant
  hex: string;       // for color preview swatch
}

export const PRESET_COLORS: ThemeColor[] = [
  { name: 'orange',  label: 'Orange',   hsl: '24.6 95% 53.1%',  hslDark: '20.5 90.2% 48.2%', hex: '#f97316' },
  { name: 'blue',    label: 'Blue',     hsl: '217 91% 60%',     hslDark: '213 94% 52%',       hex: '#3b82f6' },
  { name: 'violet',  label: 'Violet',   hsl: '262 83% 58%',     hslDark: '263 70% 50%',       hex: '#7c3aed' },
  { name: 'green',   label: 'Green',    hsl: '142 71% 45%',     hslDark: '142 69% 38%',       hex: '#22c55e' },
  { name: 'rose',    label: 'Rose',     hsl: '347 89% 60%',     hslDark: '347 77% 50%',       hex: '#f43f5e' },
  { name: 'cyan',    label: 'Cyan',     hsl: '189 94% 43%',     hslDark: '187 85% 40%',       hex: '#06b6d4' },
  { name: 'amber',   label: 'Amber',    hsl: '38 92% 50%',      hslDark: '35 91% 43%',        hex: '#f59e0b' },
  { name: 'pink',    label: 'Pink',     hsl: '330 81% 60%',     hslDark: '329 72% 52%',       hex: '#ec4899' },
  { name: 'teal',    label: 'Teal',     hsl: '173 80% 40%',     hslDark: '172 66% 35%',       hex: '#14b8a6' },
  { name: 'zinc',    label: 'Zinc',     hsl: '240 5.9% 35%',    hslDark: '240 5% 28%',        hex: '#52525b' },
];

const STORAGE_KEY = 'blog_theme_color';

interface ThemeContextValue {
  activeColor: ThemeColor;
  setColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  activeColor: PRESET_COLORS[0],
  setColor: () => {},
});

function applyColor(color: ThemeColor) {
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const hsl = isDark ? color.hslDark : color.hsl;
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
  // Keep sidebar-primary in sync for the dashboard nav
  root.style.setProperty('--sidebar-ring', hsl);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeColor, setActiveColor] = useState<ThemeColor>(PRESET_COLORS[0]);

  // On mount: load from DB first (global), then localStorage overrides for per-user preference
  useEffect(() => {
    settingsService.getSettings()
      .then((s) => {
        if (s.themeColor) {
          const dbColor = PRESET_COLORS.find((c) => c.name === s.themeColor);
          if (dbColor) {
            setActiveColor(dbColor);
            applyColor(dbColor);
          }
        }
      })
      .catch(() => {
        // Fallback to localStorage if DB fetch fails
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const found = PRESET_COLORS.find((c) => c.name === saved);
          if (found) {
            setActiveColor(found);
            applyColor(found);
          }
        }
      });
  }, []);

  const setColor = (color: ThemeColor) => {
    setActiveColor(color);
    applyColor(color);
    localStorage.setItem(STORAGE_KEY, color.name);
  };

  return (
    <ThemeContext.Provider value={{ activeColor, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
