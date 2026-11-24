import { getCollection } from 'astro:content';
import { toolTranslations } from '../i18n/content';
import type { Lang } from '../types/domain';

export async function getTools(lang: Lang) {
  const tools = await getCollection('tools');
  return tools
    .sort((a, b) => a.data.displayOrder - b.data.displayOrder)
    .map((tool) => {
      const translation = toolTranslations[lang][tool.id] ?? {};
      return {
        ...tool.data,
        id: tool.id,
        category: translation.category ?? tool.data.category,
        description: translation.description ?? tool.data.description,
      };
    });
}
