import { getCollection } from 'astro:content';
import githubData from '../data/github.json';
import { localizePath } from '../i18n';
import type { ActivityItem, GitHubSnapshot, Lang } from '../types/domain';

const github = githubData as unknown as GitHubSnapshot;

const labels = {
  zh: {
    updateTitle: (name: string) => `${name} 仓库更新`,
    updateSummary: 'GitHub 上最近一次公开推送。',
    timeline: '/timeline',
  },
  en: {
    updateTitle: (name: string) => `${name} repository updated`,
    updateSummary: 'Latest public push on GitHub.',
    timeline: '/timeline',
  },
};

export async function getActivity(lang: Lang = 'zh'): Promise<ActivityItem[]> {
  const copy = labels[lang];
  const [milestones, projects] = await Promise.all([
    getCollection('milestones'),
    getCollection('projects'),
  ]);
  const projectByRepo = new Map(
    projects.map((project) => [project.data.repository.toLowerCase(), project]),
  );
  const releases = github.repositories.flatMap((repo) => {
    const project = projectByRepo.get(repo.url.toLowerCase());
    const name = project?.data.name ?? repo.fullName.split('/')[1].replace(/[-_]/g, ' ');
    return repo.latestRelease
      ? [
          {
            id: `release:${repo.fullName}:${repo.latestRelease.tag}`,
            type: 'release' as const,
            title: `${name} ${repo.latestRelease.tag}`,
            sourceUrl: repo.latestRelease.url,
            occurredAt: repo.latestRelease.publishedAt,
            projectSlug: project?.id,
          },
        ]
      : [];
  });
  const updates = github.repositories.flatMap((repo) => {
    const project = projectByRepo.get(repo.url.toLowerCase());
    const name = project?.data.name ?? repo.fullName.split('/')[1].replace(/[-_]/g, ' ');
    return repo.pushedAt
      ? [
          {
            id: `update:${repo.fullName}:${repo.pushedAt}`,
            type: 'repository_update' as const,
            title: copy.updateTitle(name),
            summary: copy.updateSummary,
            sourceUrl: repo.url,
            occurredAt: repo.pushedAt,
            projectSlug: project?.id,
          },
        ]
      : [];
  });
  const manual = milestones.map((entry) => ({
    id: `milestone:${entry.id}`,
    type: 'milestone' as const,
    title: entry.data.title,
    summary: entry.data.description,
    sourceUrl: entry.data.sourceUrl ?? localizePath(copy.timeline, lang),
    occurredAt: `${entry.data.date}T00:00:00.000Z`,
    projectSlug: entry.data.projectSlug,
  }));

  return [...releases, ...updates, ...manual]
    .filter((item) => Number.isFinite(Date.parse(item.occurredAt)))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt));
}
