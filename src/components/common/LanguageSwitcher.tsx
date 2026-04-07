'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LANGUAGES } from '@/i18n/config';
import { aiService } from '@/services/ai.service';

// DeepL does not support Arabic — keep English UI strings but no content translation
const DEEPL_UNSUPPORTED = ['ar'];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];
  const [translationAvailable, setTranslationAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    aiService.translationStatus()
      .then(({ available }) => setTranslationAvailable(available))
      .catch(() => setTranslationAvailable(false));
  }, []);

  const changeLanguage = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    i18n.changeLanguage(code);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = code;
    }
  };

  useEffect(() => {
    document.documentElement.dir = current.dir;
    document.documentElement.lang = current.code;
  }, [current]);

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <span className="text-base leading-none">{current.flag}</span>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          {LANGUAGES.map((lang) => {
            const isEnglish = lang.code === 'en';
            const isUnsupported = DEEPL_UNSUPPORTED.includes(lang.code);
            // Disabled if translation service is unavailable AND this isn't English
            const disabled = !isEnglish && translationAvailable === false;
            const noContentTranslation = !isEnglish && isUnsupported && translationAvailable;

            const item = (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => !disabled && changeLanguage(lang.code)}
                disabled={disabled}
                className={`gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${lang.code === current.code ? 'font-semibold bg-accent' : ''}`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {noContentTranslation && (
                  <span className="text-[10px] text-muted-foreground">UI only</span>
                )}
              </DropdownMenuItem>
            );

            if (disabled) {
              return (
                <Tooltip key={lang.code}>
                  <TooltipTrigger asChild>
                    <div>{item}</div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Translation service unavailable</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return item;
          })}

          {translationAvailable === false && (
            <div className="px-2 py-1.5 border-t mt-1">
              <p className="text-[11px] text-muted-foreground">Content translation disabled — no API key</p>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
