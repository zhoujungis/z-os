import type { Lang } from '../types/domain';

export const families = [
  {
    key: 'Nano',
    code: 'N/',
    label: 'Nano',
    tagline: {
      zh: '轻量桌面工具',
      en: 'Lightweight desktop tools',
    },
    description: {
      zh: '桌面工具、开发基础设施与终端应用。',
      en: 'Desktop tools, developer infrastructure and terminal applications.',
    },
    color: '#5eead4',
  },
  {
    key: 'Z',
    code: 'Z/',
    label: 'Z AI',
    tagline: {
      zh: '本地优先 AI',
      en: 'Local-first AI',
    },
    description: {
      zh: '本地优先的 AI 助理、记忆与智能体。',
      en: 'Local-first AI assistants, memory and agents.',
    },
    color: '#a78bfa',
  },
  {
    key: 'Halo',
    code: 'H/',
    label: 'Halo',
    tagline: {
      zh: '声音与音乐',
      en: 'Sound & music',
    },
    description: {
      zh: '音乐、声音与沉浸式体验。',
      en: 'Music, sound and immersive experiences.',
    },
    color: '#f472b6',
  },
  {
    key: 'Cloud',
    code: 'C/',
    label: 'Cloud',
    tagline: {
      zh: 'Web 与边缘产品',
      en: 'Web & edge products',
    },
    description: {
      zh: 'Cloudflare 与 Web 原生产品。',
      en: 'Cloudflare and web-native products.',
    },
    color: '#fbbf24',
  },
  {
    key: 'Play',
    code: 'P/',
    label: 'Play',
    tagline: {
      zh: '游戏与实验',
      en: 'Games & experiments',
    },
    description: {
      zh: '游戏、3D 世界与趣味实验。',
      en: 'Games, 3D worlds and playful experiments.',
    },
    color: '#4ade80',
  },
  {
    key: 'Craft',
    code: 'K/',
    label: 'Craft',
    tagline: {
      zh: '工程与质量',
      en: 'Engineering & quality',
    },
    description: {
      zh: '工程效率、质量保障与知识整理。',
      en: 'Engineering leverage, quality assurance and knowledge work.',
    },
    color: '#60a5fa',
  },
] as const;

export type FamilyKey = (typeof families)[number]['key'];

export interface FamilyView {
  key: FamilyKey;
  code: string;
  label: string;
  tagline: string;
  description: string;
  color: string;
}

export function localizeFamily(family: (typeof families)[number], lang: Lang): FamilyView {
  return {
    key: family.key,
    code: family.code,
    label: family.label,
    tagline: family.tagline[lang],
    description: family.description[lang],
    color: family.color,
  };
}

export function getFamilies(lang: Lang): FamilyView[] {
  return families.map((family) => localizeFamily(family, lang));
}

export function getFamily(key: FamilyKey, lang: Lang = 'zh'): FamilyView {
  const family = families.find((item) => item.key === key) ?? families[0];
  return localizeFamily(family, lang);
}
