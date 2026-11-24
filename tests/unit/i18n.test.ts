import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  counterpartPath,
  formatDate,
  htmlLang,
  localizePath,
  stripLangPrefix,
  switchLangPath,
} from '../../src/i18n';
import { projectTranslations, toolTranslations } from '../../src/i18n/content';
import { ui } from '../../src/i18n/ui';

const contentIds = (directory: string) =>
  readdirSync(directory)
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
    .sort();

describe('localized paths', () => {
  it('keeps Chinese on the root path and prefixes English', () => {
    expect(localizePath('/', 'zh')).toBe('/');
    expect(localizePath('/projects', 'zh')).toBe('/projects');
    expect(localizePath('/', 'en')).toBe('/en');
    expect(localizePath('/projects', 'en')).toBe('/en/projects');
  });

  it('normalizes trailing slashes and missing leading slashes', () => {
    expect(localizePath('/projects/', 'zh')).toBe('/projects');
    expect(localizePath('/projects/', 'en')).toBe('/en/projects');
    expect(localizePath('about', 'en')).toBe('/en/about');
    expect(localizePath('/en/', 'zh')).toBe('/en');
  });

  it('strips the English prefix and maps counterparts', () => {
    expect(stripLangPrefix('/en')).toBe('/');
    expect(stripLangPrefix('/en/')).toBe('/');
    expect(stripLangPrefix('/en/projects/')).toBe('/projects');
    expect(stripLangPrefix('/projects')).toBe('/projects');
    expect(counterpartPath('/projects/', 'zh')).toBe('/en/projects');
    expect(counterpartPath('/en/projects', 'en')).toBe('/projects');
    expect(switchLangPath('/en/about', 'en')).toBe('/en/about');
  });

  it('declares the correct document language', () => {
    expect(htmlLang.zh).toBe('zh-CN');
    expect(htmlLang.en).toBe('en');
  });
});

describe('localized copy and content', () => {
  it('provides an English string for every interface key', () => {
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        expect(value.trim(), path).not.toBe('');
        return;
      }
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, `${path}.${key}`);
      }
    };
    walk(ui.en, 'en');
  });

  it('has Chinese and English overlays for every project', () => {
    for (const id of contentIds('src/content/projects')) {
      const zh = projectTranslations.zh[id];
      const en = projectTranslations.en[id];
      expect(zh, `${id} zh`).toBeDefined();
      expect(en, `${id} en`).toBeDefined();
      expect(en.description, `${id} en description`).toBeTruthy();
      expect(en.features?.length, `${id} en features`).toBeGreaterThan(0);
      expect(en.architecture?.length, `${id} en architecture`).toBeGreaterThan(0);
    }
  });

  it('has localized overlays for every tool', () => {
    for (const id of contentIds('src/content/tools')) {
      expect(toolTranslations.zh[id]?.category, `${id} zh category`).toBeTruthy();
      expect(toolTranslations.en[id]?.description, `${id} en description`).toBeTruthy();
    }
  });

  it('formats dates with both locales in UTC', () => {
    const value = '2026-11-16T07:36:40Z';
    const options = { year: 'numeric', month: 'short', day: '2-digit' } as const;
    expect(formatDate(value, 'zh', options)).toContain('2026');
    expect(formatDate(value, 'en', options)).toContain('2026');
    expect(formatDate(value, 'en', options)).not.toBe(formatDate(value, 'zh', options));
  });
});
