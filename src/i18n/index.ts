import type { Lang } from '../types/domain';

export const languages: Lang[] = ['zh', 'en'];

export const htmlLang: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en',
};

export const ogLocale: Record<Lang, string> = {
  zh: 'zh_CN',
  en: 'en_US',
};

export const dateLocale: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en-US',
};

export function isLang(value: unknown): value is Lang {
  return value === 'zh' || value === 'en';
}

function normalizePath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized === '/') return '/';
  return normalized.replace(/\/+$/, '') || '/';
}

export function localizePath(path: string, lang: Lang): string {
  const normalized = normalizePath(path);
  if (lang === 'zh') return normalized;
  return normalized === '/' ? '/en' : `/en${normalized}`;
}

export function stripLangPrefix(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/en') return '/';
  if (normalized.startsWith('/en/')) return normalized.slice(3);
  return normalized;
}

export function switchLangPath(path: string, lang: Lang): string {
  return localizePath(stripLangPrefix(path), lang);
}

export function counterpartPath(path: string, lang: Lang): string {
  return switchLangPath(path, lang === 'zh' ? 'en' : 'zh');
}

export function formatDate(value: string, lang: Lang, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(dateLocale[lang], {
    timeZone: 'UTC',
    ...options,
  }).format(new Date(value));
}
