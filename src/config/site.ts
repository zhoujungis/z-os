import { getCopy } from '../i18n/ui';
import { localizePath } from '../i18n';
import type { Lang } from '../types/domain';

export const site = {
  name: 'ZHOUJUN.DEV',
  product: 'Z OS',
  url: 'https://zhoujun.dev',
  github: 'https://github.com/zhoujungis',
  blog: 'https://blog.zhoujun.dev',
  music: 'https://music.zhoujun.dev/',
  author: 'ZhouJun',
} as const;

export function getSiteDescription(lang: Lang): string {
  return getCopy(lang).site.description;
}

export function getNavigation(lang: Lang): { label: string; href: string }[] {
  const labels = getCopy(lang).nav;
  return [
    { label: labels.home, href: localizePath('/', lang) },
    { label: labels.projects, href: localizePath('/projects', lang) },
    { label: labels.lab, href: localizePath('/lab', lang) },
    { label: labels.tools, href: localizePath('/tools', lang) },
    { label: labels.activity, href: localizePath('/activity', lang) },
    { label: labels.about, href: localizePath('/about', lang) },
  ];
}

const disciplines: Record<Lang, string[]> = {
  zh: ['独立开发者', 'AI 工程', '全栈', '桌面软件', '开源'],
  en: ['Independent Developer', 'AI Engineering', 'Full-stack', 'Desktop Software', 'Open Source'],
};

export function getDisciplines(lang: Lang): string[] {
  return disciplines[lang];
}
