import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    series: z.enum(['Nano', 'Z', 'Halo', 'Cloud', 'Play', 'Craft']),
    category: z.string(),
    status: z.enum(['released', 'active', 'experimental', 'archived', 'planned']),
    tagline: z.string(),
    description: z.string(),
    featured: z.boolean().default(false),
    displayOrder: z.number().int(),
    repository: z.url(),
    technologies: z.array(z.string()),
    features: z.array(z.string()),
    architecture: z.array(z.string()),
    logo: z.string().optional(),
    cover: z.string().optional(),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    websiteUrl: z.url().optional(),
    downloadUrl: z.url().optional(),
    keywords: z.array(z.string()).default([]),
  }),
});

const lab = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['demo', 'experiment', 'visualization', 'prototype']),
    technologies: z.array(z.string()),
    demoUrl: z.url().optional(),
    sourceUrl: z.url().optional(),
    status: z.enum(['active', 'experimental', 'archived']),
    cover: z.string().optional(),
    displayOrder: z.number().int(),
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tools' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.string(),
    url: z.url(),
    sourceUrl: z.url().optional(),
    projectSlug: z.string().optional(),
    serviceId: z.string().optional(),
    displayOrder: z.number().int(),
  }),
});

const milestones = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/milestones' }),
  schema: z.object({
    title: z.string(),
    date: z.iso.date(),
    description: z.string().optional(),
    projectSlug: z.string().optional(),
    sourceUrl: z.url().optional(),
  }),
});

export const collections = { projects, lab, tools, milestones };
