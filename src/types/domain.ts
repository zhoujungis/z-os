export type Lang = 'zh' | 'en';

export type ProjectStatus = 'released' | 'active' | 'experimental' | 'archived' | 'planned';

export type ProjectSeries = 'Nano' | 'Z' | 'Halo' | 'Cloud' | 'Play' | 'Craft';

export interface Project {
  name: string;
  series: ProjectSeries;
  category: string;
  status: ProjectStatus;
  tagline: string;
  description: string;
  featured: boolean;
  displayOrder: number;
  repository: string;
  technologies: string[];
  features: string[];
  architecture: string[];
  logo?: string;
  cover?: string;
  accent: string;
  websiteUrl?: string;
  downloadUrl?: string;
  keywords: string[];
}

export interface GitHubRelease {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
}

export interface RepositorySnapshot {
  key: string;
  fullName: string;
  description: string | null;
  url: string;
  stars: number | null;
  forks: number | null;
  language: string | null;
  topics: string[];
  pushedAt: string | null;
  archived: boolean;
  latestRelease: GitHubRelease | null;
  syncStatus: 'success' | 'stale' | 'unavailable';
}

export interface GitHubSnapshot {
  schemaVersion: 1;
  lastAttemptAt: string | null;
  lastSuccessfulAt: string | null;
  repositories: RepositorySnapshot[];
}

export interface BlogPost {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}

export interface BlogSnapshot {
  schemaVersion: 1;
  lastSuccessfulAt: string | null;
  posts: BlogPost[];
}

export type ActivityType = 'release' | 'repository_update' | 'milestone';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  summary?: string;
  sourceUrl: string;
  occurredAt: string;
  projectSlug?: string;
}

export type ServiceState = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface ServiceCheck {
  checkedAt: string;
  status: Exclude<ServiceState, 'unknown'>;
  responseMs: number | null;
}

export interface ServiceSnapshot {
  id: string;
  name: string;
  url: string;
  status: ServiceState;
  checkedAt: string | null;
  responseMs: number | null;
  history: ServiceCheck[];
}

export interface StatusSnapshot {
  schemaVersion: 1;
  services: ServiceSnapshot[];
}

export interface SearchDocument {
  id: string;
  type: 'project' | 'lab' | 'tool' | 'page' | 'activity';
  title: string;
  description: string;
  url: string;
  tags: string[];
  keywords?: string[];
}
