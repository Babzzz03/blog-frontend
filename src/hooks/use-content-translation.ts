'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { aiService } from '@/services/ai.service';

// Module-level cache — survives component re-mounts within the same browser session
const cache = new Map<string, string>();

/**
 * Translates an array of strings (plain text or HTML) to the currently selected language.
 *
 * @param texts    - Array of strings to translate (may contain HTML)
 * @param cacheKeys - Stable unique identifiers per text (e.g. postId). Falls back to
 *                   first 80 chars of each text. Use IDs for long content to keep
 *                   the dep key short.
 */
export function useContentTranslation(texts: string[], cacheKeys?: string[]) {
  const { i18n } = useTranslation();
  // Normalise locale: 'en-US' → 'en'
  const lang = (i18n.language || 'en').split('-')[0];

  const [translated, setTranslated] = useState<string[]>(texts);
  const [isTranslating, setIsTranslating] = useState(false);
  const prevDepsKey = useRef('');

  const keys = cacheKeys ?? texts.map((t) => t.slice(0, 80));
  // Use IDs (keys) rather than full text so the dep string stays short
  const depsKey = `${lang}::${keys.join('|')}`;

  useEffect(() => {
    if (depsKey === prevDepsKey.current) return;
    prevDepsKey.current = depsKey;

    // Nothing to translate yet
    if (!texts.length || texts.every((t) => !t?.trim())) {
      setTranslated(texts);
      return;
    }

    // English — return originals immediately
    if (lang === 'en') {
      setTranslated(texts);
      return;
    }

    // Check cache for each key
    const cachedValues = keys.map((k) => cache.get(`${lang}::${k}`));
    if (cachedValues.every(Boolean)) {
      setTranslated(cachedValues as string[]);
      return;
    }

    // Find which ones still need translating
    const missingIndices = keys
      .map((k, i) => (cache.has(`${lang}::${k}`) ? -1 : i))
      .filter((i) => i >= 0);
    const textsToTranslate = missingIndices.map((i) => texts[i]);

    setIsTranslating(true);
    aiService
      .translate(textsToTranslate, lang)
      .then(({ translations }) => {
        missingIndices.forEach((idx, i) => {
          cache.set(`${lang}::${keys[idx]}`, translations[i] || texts[idx]);
        });
        setTranslated(keys.map((k, i) => cache.get(`${lang}::${k}`) || texts[i]));
      })
      .catch(() => {
        // On error keep showing originals
        setTranslated(texts);
      })
      .finally(() => setIsTranslating(false));
  }, [depsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // While translating or before translated state syncs, fall back to originals
  return {
    translated: translated.length === texts.length ? translated : texts,
    isTranslating,
  };
}
