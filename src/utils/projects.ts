import { getCollection } from 'astro:content';
import githubData from '../data/github.json';
import { projectTranslations } from '../i18n/content';
import type { GitHubSnapshot, Lang, Project } from '../types/domain';
import type { CollectionEntry } from 'astro:content';

const github = githubData as unknown as GitHubSnapshot;

export interface ProjectView {
  id: string;
  data: Project;
}

export function localizeProject(project: CollectionEntry<'projects'>, lang: Lang): ProjectView {
  const base = project.data;
  const translation = projectTranslations[lang][project.id] ?? {};
  return {
    id: project.id,
    data: {
      ...base,
      category: translation.category ?? base.category,
      tagline: translation.tagline ?? base.tagline,
      description: translation.description ?? base.description,
      features: translation.features ?? base.features,
      architecture: translation.architecture ?? base.architecture,
    },
  };
}

export async function getSortedProjects() {
  const projects = await getCollection('projects');
  return projects.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      a.data.displayOrder - b.data.displayOrder,
  );
}

export async function getProjects(lang: Lang): Promise<ProjectView[]> {
  const projects = await getSortedProjects();
  return projects.map((project) => localizeProject(project, lang));
}

export function getRepository(repositoryUrl: string) {
  return github.repositories.find((repo) => repo.url.toLowerCase() === repositoryUrl.toLowerCase());
}

export function getGitHubSnapshot() {
  return github;
}
