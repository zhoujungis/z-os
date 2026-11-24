import { getCollection } from 'astro:content';
import { localizePath } from '../i18n';
import { getCopy } from '../i18n/ui';
import { getActivity } from './activity';
import { getProjects } from './projects';
import { getTools } from './tools';
import type { Lang, SearchDocument } from '../types/domain';

const pageCopy = {
  zh: {
    home: { description: 'ZhouJun 的个人站点：独立开发，公开构建', tags: ['Z OS', '首页'] },
    projects: { description: '全部 Nano、Z 与 Halo 应用', tags: ['项目', '应用', '软件'] },
    lab: { description: '技术实验、原型与 Demo', tags: ['实验'] },
    tools: { description: '真实上线的工具与独立产品', tags: ['工具'] },
    activity: { description: '开发动态、Release 与项目里程碑', tags: ['动态'] },
    timeline: { description: '公开发布与项目里程碑', tags: ['时间轴'] },
    about: { description: '独立开发者、技术方向与开发理念', tags: ['关于'] },
    status: { description: '公开服务状态与观测可用率', tags: ['状态'] },
    activityFallback: 'Z OS 公开动态',
  },
  en: {
    home: {
      description: "ZhouJun's personal site: independent software, built in public",
      tags: ['Z OS', 'home'],
    },
    projects: {
      description: 'All Nano, Z and Halo applications',
      tags: ['projects', 'applications', 'software'],
    },
    lab: { description: 'Technical experiments, prototypes and demos', tags: ['experiments'] },
    tools: { description: 'Live tools and independent products', tags: ['tools'] },
    activity: {
      description: 'Development activity, releases and project milestones',
      tags: ['activity', 'releases'],
    },
    timeline: { description: 'Public releases and project milestones', tags: ['timeline'] },
    about: {
      description: 'Independent developer, focus areas and build philosophy',
      tags: ['about'],
    },
    status: { description: 'Public service status and observed availability', tags: ['status'] },
    activityFallback: 'Z OS public activity',
  },
};

export async function buildSearchDocuments(lang: Lang): Promise<SearchDocument[]> {
  const copy = getCopy(lang);
  const pages = pageCopy[lang];
  const [projects, lab, tools, activity] = await Promise.all([
    getProjects(lang),
    getCollection('lab'),
    getTools(lang),
    getActivity(lang),
  ]);
  const page = (
    key: 'home' | 'projects' | 'lab' | 'tools' | 'activity' | 'timeline' | 'about' | 'status',
    path: string,
    title: string,
  ): SearchDocument => {
    const entry = pages[key];
    return {
      id: `page:${key}`,
      type: 'page',
      title,
      description: entry.description,
      url: localizePath(path, lang),
      tags: entry.tags,
    };
  };
  const pageDocuments: SearchDocument[] = [
    page('home', '/', copy.pageTitles.home),
    page('projects', '/projects', copy.pageTitles.projects),
    page('lab', '/lab', copy.pageTitles.lab),
    page('tools', '/tools', copy.pageTitles.tools),
    page('activity', '/activity', copy.pageTitles.activity),
    page('timeline', '/timeline', copy.pageTitles.timeline),
    page('about', '/about', copy.pageTitles.about),
    page('status', '/status', copy.pageTitles.status),
  ];
  return [
    ...pageDocuments,
    ...projects.map((entry) => ({
      id: `project:${entry.id}`,
      type: 'project' as const,
      title: entry.data.name,
      description: `${entry.data.tagline} ${entry.data.description}`,
      url: localizePath(`/projects/${entry.id}`, lang),
      tags: [entry.data.series, entry.data.category, ...entry.data.technologies],
      keywords: entry.data.keywords,
    })),
    ...lab.map((entry) => ({
      id: `lab:${entry.id}`,
      type: 'lab' as const,
      title: entry.data.title,
      description: entry.data.description,
      url: entry.data.demoUrl ?? entry.data.sourceUrl ?? localizePath('/lab', lang),
      tags: [entry.data.type, ...entry.data.technologies],
    })),
    ...tools.map((entry) => ({
      id: `tool:${entry.id}`,
      type: 'tool' as const,
      title: entry.name,
      description: entry.description,
      url: entry.url,
      tags: [entry.category],
    })),
    ...activity.slice(0, 40).map((item) => ({
      id: item.id,
      type: 'activity' as const,
      title: item.title,
      description: item.summary ?? pages.activityFallback,
      url: item.sourceUrl,
      tags: [item.type],
    })),
  ];
}
