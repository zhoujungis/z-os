# ZHOUJUN.DEV / Z OS v1.0

[中文](./README.md) | [English](./README.en.md)

The personal digital portal of ZhouJun. The site is statically generated with Astro and enhanced by Vue 3 islands for search, filtering, navigation and theme switching. It presents 30 real applications, public activity, a blog entry point, tools and service observations. The entire site is bilingual — Chinese at the root paths, English under `/en/`. The visual language is print/editorial: paper, ink and vermilion, with light mode as the default.

Live site: <https://zhoujun.dev>

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Features in depth](#features-in-depth)
- [Pages and routes](#pages-and-routes)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [Scripts](#scripts)
- [Content model](#content-model)
- [Snapshots and sync](#snapshots-and-sync)
- [Testing and quality](#testing-and-quality)
- [CI / CD](#ci--cd)
- [Design system](#design-system)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [Data integrity and limitations](#data-integrity-and-limitations)

## Overview

- **30 applications** across six families:
  - `Nano/` lightweight desktop tools and developer infrastructure;
  - `Z/` local-first AI assistants, memory and agents;
  - `Halo/` music, sound and immersive experiences;
  - `Cloud/` Cloudflare and web-native products;
  - `Play/` games, 3D worlds and playful experiments;
  - `Craft/` engineering leverage, quality assurance and knowledge work.
- Currently **17 released, 13 in development**, with **8 featured** on the homepage.
- **Static output**: builds read only snapshots committed to the repository and never hit external networks; the HTML can be generated offline and the output hosted anywhere.
- **Shared bilingual implementation**: each page exists once (`src/views/`), while `src/pages/` and `src/pages/en/` keep thin route wrappers that pass `lang`.
- **On-demand hydration**: overview panels, stats, the command palette, theme switching and the mobile menu are Vue islands; everything else is plain HTML.
- **Honest data**: versions and releases come from GitHub snapshots; the status page reports low-frequency observations without claiming an SLA; missing assets hide the module instead of producing a fake logo or screenshot.

## Architecture

```text
content JSON ──┐
snapshot JSON ─┼─> Astro Content Collections / Zod validation
config TS     ─┘            │
                            ├─> src/views (shared page implementations)
                            ├─> src/pages (zh/en route wrappers)
                            ├─> src/pages/*/search-index.json.ts (per-language index)
                            │
                            └─> astro build ─> dist/
                                                 ├─ HTML (bilingual, readable without JS)
                                                 ├─ _headers (CSP / caching)
                                                 ├─ sitemap-index.xml
                                                 └─ static assets (local fonts, images)

Runtime: Vue islands (search / filters / menu / theme) + MiniSearch index (loaded when the palette first opens)
```

The build performs all content reading, Zod validation, i18n merging, sorting and index generation. There is no runtime server and no data fetching at runtime.

## Tech stack

| Layer         | Choice                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | Astro 7, `output: 'static'`, hover prefetch                                     |
| Interactivity | Vue 3 islands (`@astrojs/vue`), MiniSearch 7                                    |
| Language      | TypeScript (strict), Zod 4 content schemas                                      |
| Styling       | Tailwind CSS v4 + design tokens in `src/styles/global.css`                      |
| Fonts         | Self-hosted via `@fontsource`: Inter Variable, Instrument Serif, JetBrains Mono |
| Testing       | Vitest (unit), Playwright (E2E), `@axe-core/playwright`                         |
| Build scripts | `tsx` running the sync and probe scripts in `scripts/`                          |
| Deployment    | Cloudflare Pages (Direct Upload) + GitHub Actions                               |

Engine requirement: Node.js `>=22` (CI uses 22).

## Features in depth

### Bilingual content and routing

- Chinese lives at the root (`/`, `/projects`, …); English is always prefixed with `/en`. Path helpers live in `src/i18n/index.ts`:
  - `localizePath()` produces the path for a given language;
  - `stripLangPrefix()` removes `/en`;
  - `switchLangPath()` / `counterpartPath()` produce the other language's address;
  - paths are normalized for trailing slashes and missing leading slashes.
- An inline script adds the current query string and hash to language-switch links, so switching keeps you on the same content.
- Localized metadata is emitted: `<html lang="zh-CN|en">`, `og:locale` (`zh_CN` / `en_US`), canonical, and `hreflang` (`zh-CN`, `en`, and `x-default` pointing at Chinese).
- Copy has three layers:
  1. `src/i18n/ui.ts`: interface copy; `zh` and `en` must have matching keys, and a unit test walks `en` to reject empty strings;
  2. `src/i18n/content.ts`: overlays for projects and tools, keyed by content filename, falling back to the JSON values when absent;
  3. content JSON: the factual source, never duplicated per language.
- Chinese typography: Chinese has no true italic, so `:lang(zh)` forces `em`, `.serif`, `.eyebrow` and similar elements upright; italic serif is reserved for Latin text.
- Dates use `Intl.DateTimeFormat` with a fixed UTC time zone, via `zh-CN` / `en-US`.

### Search and command palette

- A per-language index is generated at build time: `/search-index.json` and `/en/search-index.json`.
- The index contains: 8 fixed pages, every project, Lab, Tools, and the latest 40 activity items.
- MiniSearch configuration:
  - searchable fields: `title`, `description`, `tags`, `keywords`;
  - boosts: `title: 4`, `tags: 2`, `keywords: 2`;
  - prefix matching enabled;
  - fuzzy matching only for purely lowercase alphanumeric terms of length ≥ 6 (`0.2`), so short words like `rust` / `rest` do not collide;
  - Chinese expands to the full token plus bigrams (e.g. 「桌面浏览器」 also yields 「桌面」「面浏」「浏览」「览器」);
  - English identifiers split on camelCase, hyphens, underscores and dots, so `NanoBrowser` is reachable via `nano` and `browser`;
  - queries keep compound identifiers intact, so searching `NanoBrowser` does not match every Nano project.
- The palette is `client:only="vue"` and loads the current language's index only on first open. It offers quick links, keyboard search, arrow-key selection and Escape to close; the header shows `⌘ K` or `Ctrl K` depending on platform.
- Result highlighting covers up to 6 terms and escapes regex metacharacters.
- Without JavaScript the palette is unavailable; `/search` remains a shareable fallback with a `noscript` note.

### Project index and filtering

- Sorting: `featured` first, then ascending `displayOrder`; if the featured count changes, re-check the homepage copy, layout and E2E assertions.
- URL parameters combine: `q`, `family`, `category`, `status`, `tech`. Each can be added or reset independently; values are language-agnostic while labels follow the active locale.
- The six family entry points on the homepage preselect the matching `family` filter.
- Project cards and detail pages read the same content source; detail pages additionally merge repository info and the latest release from the GitHub snapshot.

### Activity and timeline

- Activity has three sources:
  1. the latest GitHub release per repository;
  2. the most recent public push per repository;
  3. manually confirmed milestones in `src/content/milestones/`.
- All three are merged and sorted together; curated milestones must be distinguishable from public activity and cite a real source.
- The blog is linked, not republished; the blog snapshot only supplies article lists and summaries for the homepage/activity views.
- `/timeline` and `/activity` share the same data, so the two narratives cannot drift apart.

### Status observation

- Only the allowlist in `src/config/services.ts` is probed: Blog, Music, Routewise, Happy Games, Block World 3D and Echo Space.
- Probe rules (`scripts/probe-status.ts`):
  - 10-second timeout per request;
  - redirects are followed manually, at most 5 hops, and only to **https origins inside the allowlist**; anything else counts as a failure;
  - a successful response ≤ 3000 ms is `operational`, > 3000 ms is `degraded`, a failed request is `outage`;
  - every result is appended to a rolling 7-day history; older entries are pruned;
  - anything unconfirmed stays `unknown`.
- Page calculations (`src/utils/status.ts`):
  - a sample older than 26 hours is stale and shown as `unknown`;
  - observed availability is only shown when history spans at least 5 days with more than one sample; otherwise the page says "collecting data";
  - both `operational` and `degraded` count as available samples.
- Status is a low-frequency observation log, not an SLA, and makes no uptime guarantee; the page must keep that wording.

### Theme and reading experience

- Light by default (white background); `localStorage['z-os-theme']` stores `light` / `dark` and restores it on reload.
- A pre-paint inline script sets `data-theme` and updates `theme-color` to avoid a flash of the wrong theme; it falls back to light if storage fails.
- Scroll progress is written to the `--scroll-progress` CSS variable; the header compacts after 10px of scroll.
- `[data-reveal]` elements fade in via IntersectionObserver; with `prefers-reduced-motion` or no IntersectionObserver they are shown immediately.
- Core homepage content does not depend on JavaScript. Skip links, visible focus, heading hierarchy and responsive layout from 320px up are covered by E2E.

### SEO and security

- `Seo.astro` emits title, description, canonical, three `hreflang` links, Open Graph, Twitter Card and optional JSON-LD.
- Sitemap generation uses `@astrojs/sitemap`, excluding `/search` and `/404`.
- `robots.txt`, `site.webmanifest`, favicon and an Apple Touch Icon are provided; the default OG image is `public/images/og-default.png`.
- `public/_headers` defines:
  - `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a strict referrer policy and a minimal permissions policy;
  - CSP: same-origin by default, inline script/style allowed (needed by the pre-paint theme script), objects and external framing blocked, HTTPS enforced;
  - `/_astro/*` cached for one year as immutable; `/images/*` cached for 30 days.

## Pages and routes

| Route                | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `/`                  | Home: hero, stats, family overview, featured projects, build notes, developer panel |
| `/projects`          | Project index with combinable filters                                               |
| `/projects/[slug]`   | Project detail: summary, features, architecture, stack, repo, release               |
| `/lab`               | Experiments; stays empty until content is confirmed                                 |
| `/tools`             | Real, usable tools and sites (currently 5)                                          |
| `/activity`          | Public activity, releases and code updates                                          |
| `/timeline`          | Curated milestones merged with public activity                                      |
| `/status`            | Service status snapshots (low-frequency observation)                                |
| `/about`             | About, focus areas and working principles                                           |
| `/search`            | Search page with shareable `?q=` queries                                            |
| `/search-index.json` | Search index for the current language (generated at build)                          |
| `/404`               | Not found                                                                           |

English versions live under the same paths prefixed with `/en/`; the English index is `/en/search-index.json`. The current build produces roughly 80 pages.

## Project structure

```text
src/
  assets/           Build-time assets
  components/
    activity/       Activity list and entries
    common/         Shared small widgets
    home/           Hero, StatsGrid, etc.
    layout/         SiteHeader, SiteFooter, LanguageSwitch, Seo, ThemeToggle, MobileNavigation
    projects/       ProjectCard, etc.
    search/         CommandPalette (Vue)
    status/         Status cards and history
  config/
    site.ts         Site info, navigation, discipline tags
    families.ts     Codes, names, taglines and colors for the six families
    services.ts     Status probe allowlist
  content/
    projects/       30 project JSON files
    lab/            Experiments (empty)
    tools/          Tools (5)
    milestones/     Curated milestones (empty)
  content.config.ts Glob loaders and Zod schemas for all four collections
  data/             github.json, blog.json, status.json
  i18n/             ui.ts, content.ts, index.ts
  layouts/          BaseLayout: fonts, theme script, header/footer, command palette
  pages/            Chinese routes, /en routes, search index endpoints
  styles/           global.css: tokens, typography, spacing, language policy
  types/            domain.ts: snapshot, project and search document types
  utils/            projects, search, search-index, activity, status, tools
  views/            Shared page implementations for both languages
scripts/
  sync-github.ts    GitHub repos and releases → src/data/github.json
  sync-blog.ts      Blog feed → src/data/blog.json
  probe-status.ts   Allowlist probing → src/data/status.json
  github-cache.json ETag cache (maintained by the sync script)
tests/
  unit/             i18n, search, snapshots, status
  e2e/              core.spec.ts
docs/
  maintenance.md    Maintenance and deployment handbook
  data-sources.md   Asset sources and rejected-asset notes
.github/workflows/
  ci.yml            Verify, build, E2E, deploy
  sync-content.yml  Snapshot sync daily
  probe-status.yml  Status probe daily
```

## Local development

### Requirements

- Node.js 22 or newer (`package.json` `engines` matches CI).
- npm (a `package-lock.json` is committed; use `npm ci` for reproducible installs).
- Chromium for E2E; install the browser before the first run.

### Getting started

```sh
npm ci
npm run dev
```

- Default URL: <http://localhost:4321>.
- The dev server binds `0.0.0.0` for LAN or container access.
- Production build and preview:

```sh
npm run build
npm run preview
```

- Output goes to `dist/`; preview also defaults to port 4321.
- **The dev and preview servers compete for 4321**, so do not run both. E2E starts its own preview and reuses an existing 4321 server locally.

### Recommended workflow

```sh
npm run check && npm run lint && npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Scripts

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Astro dev server (`0.0.0.0:4321`)                  |
| `npm run build`        | Static build into `dist/`                          |
| `npm run preview`      | Preview the production build (`0.0.0.0:4321`)      |
| `npm run check`        | `astro check`: types and templates                 |
| `npm run lint`         | ESLint (Astro / Vue / TypeScript / Node scripts)   |
| `npm run format`       | Prettier, writing changes                          |
| `npm run format:check` | Prettier check only                                |
| `npm test`             | Vitest unit tests                                  |
| `npm run test:e2e`     | Playwright E2E (build first)                       |
| `npm run sync:github`  | Sync GitHub repos, push times and latest releases  |
| `npm run sync:blog`    | Sync the RSS / Atom feed declared by the blog      |
| `npm run sync`         | Run both syncs in order                            |
| `npm run status:probe` | Probe allowlisted services and update observations |

## Content model

All four collections use a `glob` loader over `src/content/<collection>/*.json` and are validated by Zod in `src/content.config.ts`; any invalid field fails the build.

### Projects

| Field          | Type / constraint                                                   | Notes                                     |
| -------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| `name`         | `string`                                                            | Display name                              |
| `series`       | `Nano` \| `Z` \| `Halo` \| `Cloud` \| `Play` \| `Craft`             | Family                                    |
| `category`     | `string`                                                            | Real category                             |
| `status`       | `released` \| `active` \| `experimental` \| `archived` \| `planned` | Release state                             |
| `tagline`      | `string`                                                            | One-line summary                          |
| `description`  | `string`                                                            | Longer introduction                       |
| `featured`     | `boolean`, defaults to `false`                                      | Homepage feature                          |
| `displayOrder` | integer                                                             | Sort weight                               |
| `repository`   | URL                                                                 | GitHub repo (also the snapshot allowlist) |
| `technologies` | `string[]`                                                          | Stack                                     |
| `features`     | `string[]`                                                          | Feature points                            |
| `architecture` | `string[]`                                                          | Architecture notes                        |
| `logo`         | optional path                                                       | `/images/projects/...`                    |
| `cover`        | optional path                                                       | Cover screenshot                          |
| `accent`       | `#RRGGBB`                                                           | Brand color                               |
| `websiteUrl`   | optional URL                                                        | Site / live demo                          |
| `downloadUrl`  | optional URL                                                        | Only for real downloads                   |
| `keywords`     | `string[]`, defaults empty                                          | Search keywords                           |

The English overlay must supply `category`, `tagline`, `description`, `features` and `architecture` for every project; the Chinese overlay may override only what differs. Unit tests ensure both languages exist for every project.

### Lab

`title`, `description`, `type` (`demo` / `experiment` / `visualization` / `prototype`), `technologies[]`, optional `demoUrl` / `sourceUrl` / `cover`, `status` (`active` / `experimental` / `archived`) and `displayOrder`.

### Tools

`name`, `description`, `category`, `url`, optional `sourceUrl` / `projectSlug` / `serviceId` and `displayOrder`. Only real, live products are listed; unlaunched domains are not added. Categories and English descriptions live in `toolTranslations` in `src/i18n/content.ts`.

### Milestones

`title`, ISO `date`, optional `description` / `projectSlug` / `sourceUrl`. Curated milestones must cite a real source and be distinguishable from automated GitHub activity.

### Sorting, featuring and empty states

- Projects: `featured` descending, then `displayOrder` ascending.
- Tools: `displayOrder` ascending.
- Activity: occurrence time descending.
- When Lab or Milestones are empty, those pages stay in an empty state; **do not fabricate entries to fill pages**. Build-time "empty collection" notices are expected.

### Asset rules

- Real logos go in `public/images/projects/` and are referenced as `/images/projects/<file>` in `logo`; covers work the same way via `cover`.
- Both must be recorded in `docs/data-sources.md` with source URL and retrieval date.
- Without dedicated assets, omit the field and use a wordmark or hide the module — never a framework default icon or a fabricated product UI.
- Version numbers and releases never live in content JSON; they come only from snapshots.

### Adding a project

1. Create a JSON file in `src/content/projects/` using the fields above; `repository` must be a verifiable GitHub URL.
2. Confirm `series`, `category` and `status` against public sources; unreleased projects use `active`, and no fake download URLs or releases are created.
3. Choose `featured` and `displayOrder`; if the featured count changes, update the homepage copy, layout and E2E count assertions.
4. If assets exist, place them in `public/images/projects/` and update `docs/data-sources.md`.
5. Add entries to both `projectTranslations.zh` and `.en` in `src/i18n/content.ts`, keyed by filename.
6. Run `npm run sync:github` and confirm the repository and release appear in `src/data/github.json`.
7. Run `npm run check && npm run lint && npm test && npm run build && npm run test:e2e`.
8. For a new fixed page, also add both language routes, navigation, search index, Sitemap and the E2E route list.

See `docs/maintenance.md` for the full workflow.

## Snapshots and sync

Builds read snapshots only and never make external requests. Failed syncs keep the last successful data, and network outages must not block builds. All three snapshots carry `schemaVersion: 1`.

### `src/data/github.json` — `npm run sync:github`

- The allowlist comes from `repository` in `src/content/projects/*.json`: only canonical `owner/repo` URLs on `github.com` / `www.github.com`, deduplicated case-insensitively.
- Two requests per repository: metadata and `releases?per_page=100`.
- 10-second timeout; supports `ETag` / `If-None-Match` and reuses previous data on 304; the cache is written to `scripts/github-cache.json` (committed by the sync workflow).
- Only public fields are kept: description, URL, stars, forks, primary language, topics, last push, archived state and latest release.
- Draft releases are filtered out; the newest non-draft release is selected (its prerelease flag is retained).
- Per-repository failure: with previous data it is marked `syncStatus: 'stale'` and old values retained; if it never succeeded it is `'unavailable'` with empty fields rather than fake zeros.
- `GITHUB_TOKEN` is optional for higher rate limits; CI uses the platform `github.token`. **Never commit a token.**

### `src/data/blog.json` — `npm run sync:blog`

- Fetches `https://blog.zhoujun.dev` and only considers declared `application/rss+xml` / `application/atom+xml` alternate links, trying each in turn.
- 10-second timeout; supports both RSS and Atom.
- Summaries strip `<script>` / `<style>` and all tags, decode entities and collapse whitespace, leaving plain text only.
- On failure, previous posts and `lastSuccessfulAt` are kept; no error content is written.

### `src/data/status.json` — `npm run status:probe`

- Probe logic and thresholds are described in [Status observation](#status-observation).
- Each run appends one sample; history is pruned to 7 days.
- A missing or corrupt snapshot never prevents a fresh probe round.

### Tokens and security

- Tokens never belong in source, snapshots, frontend environment variables or the repository; put secrets only in GitHub Secrets.
- Optional local setup — PowerShell: `$env:GITHUB_TOKEN="..."`; bash: `export GITHUB_TOKEN=...`.
- Snapshots are build inputs; changes must be committed before they reach a deployment.

## Testing and quality

### Commands

```sh
npm run check
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

### Unit tests (Vitest, 30 tests)

- `tests/unit/i18n.test.ts`
  - localized path generation, prefix stripping, trailing-slash normalization, language switching;
  - `htmlLang` declarations;
  - walking `ui.en` to reject empty copy;
  - bilingual overlays for every project and tool;
  - locale-aware dates formatted in UTC.
- `tests/unit/search.test.ts`
  - Chinese full tokens + bigrams; English camelCase / hyphen splitting;
  - search by name, stack and Chinese description;
  - no fuzzy matching for short terms, no compound-query expansion, title ranking above body;
  - empty queries and unmatched queries return nothing;
  - highlight fragment splitting.
- `tests/unit/snapshots.test.ts`
  - GitHub field normalization preserves zeros and drops private fields;
  - draft releases ignored, newest non-draft chosen;
  - failures keep old snapshots or mark them unavailable;
  - only declared feed links discovered;
  - summaries strip tags/scripts and decode entities;
  - RSS parsing keeps no HTML;
  - status probing rejects off-allowlist redirects;
  - slow/failed/missing classification and 7-day pruning.
- `tests/unit/status.test.ts`
  - no data stays `unknown`;
  - samples older than 26 hours count as stale;
  - no availability shown before at least 5 days of history;
  - full-window availability counts `operational + degraded`.

### E2E (Playwright, 20 tests × 2 configurations)

Config: `playwright.config.ts` — 30-second timeout, 2 workers, traces and screenshots retained on failure; projects are Desktop Chrome and Pixel 5 (mobile-chromium). The `webServer` runs `npm run preview -- --port 4321`, reusing an existing server locally and always starting fresh in CI.

Coverage:

- every core route renders with correct title, language, canonical and `hreflang`;
- language switching preserves path and query;
- both locales expose 30 applications and 8 featured projects;
- filters combine and reset, with localized English controls;
- family entry points preselect the matching filter;
- header scroll state, progress bar and platform-aware search shortcut;
- activity keeps every code update without repeated summaries;
- the command palette supports keyboard search and Escape;
- `/search?q=` is shareable;
- the blog is linked without republishing articles;
- theme persists across reloads;
- the mobile menu closes via backdrop, button and Escape, and navigates correctly;
- compact controls remain usable at 320px;
- primary pages do not overflow at responsive widths;
- main content is readable without JavaScript;
- reduced motion keeps content complete;
- the status page does not invent uptime or availability;
- core pages pass basic axe checks in light/dark and both locales.

### Manual review checklist

After UI changes, check at least 320, 375, 768 and 1440px, and verify:

- Chinese root paths and `/en/`, in both light and dark;
- path, query and hash after language switching;
- Tab order, visible focus and Escape-closing menus;
- no horizontal overflow;
- readability with JavaScript disabled;
- no hydration errors or 404s in the browser console.

Real-device Safari / Android, production Lighthouse, HTTPS and DNS must be verified in the deployed environment; local results are not production results.

## CI / CD

Three workflows live in `.github/workflows/`:

| Workflow           | Trigger                                | Purpose                                                             |
| ------------------ | -------------------------------------- | ------------------------------------------------------------------- |
| `ci.yml`           | PRs, pushes to `main`, manual dispatch | Verify, build and E2E; deploy to Cloudflare Pages after main passes |
| `sync-content.yml` | Daily (`43 1 * * *`), manual           | Sync GitHub/blog snapshots and commit changes                       |
| `probe-status.yml` | Daily (`17 1 * * *`), manual           | Probe allowlisted services and commit `src/data/status.json`        |

### `ci.yml` flow

1. **verify** (`ubuntu-latest`, 20-minute timeout):
   - `actions/checkout@v4`;
   - `actions/setup-node@v4`, Node 22, npm cache;
   - `npm ci`;
   - `npm run check` → `npm run lint` → `npm test` → `npm run build`;
   - cache `~/.cache/ms-playwright` by `package-lock.json` hash, install Chromium (`--with-deps`);
   - `npm run test:e2e`;
   - on failure, upload `test-results` (screenshots / traces / report, kept 7 days);
   - on main, upload `dist` (kept 1 day) for the deploy job.
2. **deploy**:
   - requires `verify` success;
   - only on `push` or `workflow_dispatch` to `refs/heads/main`;
   - `environment: production`, URL <https://zhoujun.dev>;
   - downloads the exact tested `dist`; no rebuild;
   - `cloudflare/wrangler-action@v3` runs `pages deploy dist --project-name=... --branch=main`.
3. PRs test but never deploy; `concurrency: ci-${{ github.ref }}` cancels stale runs on the same branch.

### First-time deployment setup

1. Create a Cloudflare Pages project (**Direct Upload**, production branch `main`), named `z-os` by default; to rename it, set the repository variable `CLOUDFLARE_PAGES_PROJECT`.
2. Create an API token with only **Pages:Edit** permission.
3. Add these repository Secrets:
   - `CLOUDFLARE_API_TOKEN` (required, Pages:Edit permission)
   - `CLOUDFLARE_ACCOUNT_ID` (optional; falls back to the same account ID used by `halo_music`)
4. Bind `zhoujun.dev` in Pages and configure DNS / HTTPS.
5. Enable repository Actions; if automatic sync is enabled, confirm the default branch and `contents: write` permission match repository policy.
6. After the first launch, verify: canonical tags, Sitemap, OG image, Manifest, `_headers`, every project detail page, and the blog/GitHub external links.

### Rollback

The Cloudflare Pages dashboard keeps a deployment history under Deployments and can roll back to a previous successful version; you can also deploy a local `dist` or re-run `ci.yml` manually.

### Deployment frequency and quotas

- `sync-content.yml` and `probe-status.yml` each run once a day; when snapshots change, each may commit once, and every commit to `main` triggers the `ci.yml` deploy — typically no more than 2 automated deploys per day.
- The Cloudflare Pages free plan has a limited deployment quota; check your allowance before enabling long-running automation, or lower the sync cadence further / stop snapshot commits from triggering deployments.
- The workflow commits nothing when snapshots are unchanged, so the real count depends on whether sync results change.

## Design system

- **Visual language**: paper background, ink text and vermilion accents, with editorial whitespace and hairline rules — deliberately avoiding a generic SaaS template feel.
- **Fonts**:
  - Inter Variable for Latin body and headings;
  - Instrument Serif (400 italic) for Latin emphasis and editorial labels;
  - JetBrains Mono Variable for data, labels and code-like information;
  - Chinese: a system stack of PingFang SC / Hiragino Sans GB / MiSans / HarmonyOS Sans / Source Han Sans / Microsoft YaHei; emphasis uses Source Han Serif / Songti system fonts;
  - all self-hosted through `@fontsource`, with no external CDN.
- **Themes**: light by default (white background), dark restored from local preference; both share the CSS variables in `src/styles/global.css`, with no duplicated palette per component.
- **Rhythm**: shared `section` / `section-compact` / `page-hero` spacing controls vertical rhythm, with tighter mobile overrides.
- **Motion**: scroll progress and reveals serve content and respect `prefers-reduced-motion`.
- **Chinese typography**: `:lang(zh)` forces upright text to avoid synthesized italics; digits and Latin labels still use mono or serif faces.

## Troubleshooting

| Symptom                                        | Cause / fix                                                                                     |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Port conflict between `dev` and `preview`      | Both default to 4321; stop one or pass `--port` to one of them                                  |
| `test:e2e` opens a blank page or stale content | Run `npm run build` first; Playwright previews `dist/` without building                         |
| Playwright reports a missing browser           | Run `npx playwright install chromium` (CI adds `--with-deps`)                                   |
| `sync:github` returns 403 / rate limit         | Set `GITHUB_TOKEN` and retry; anonymous limits are lower                                        |
| Build warns that Lab / Milestones are empty    | Expected; empty collections mean nothing is confirmed, never fabricate                          |
| A release is missing from the page             | Check `src/data/github.json`, rerun `npm run sync:github`; drafts are excluded                  |
| Status page shows "collecting data"            | Less than 5 days of history or too few samples; by design                                       |
| Deploy returns 403 / project not found         | Check `CLOUDFLARE_API_TOKEN` permissions, `CLOUDFLARE_ACCOUNT_ID` and the project name variable |
| Deploy succeeded but the domain is stale       | Check the Pages custom domain, DNS and caches; confirm the deployed branch is `main`            |
| Flaky E2E timeouts in CI                       | Reproduce locally and inspect `playwright-artifacts`; check external links and network          |

## Documentation

- `docs/maintenance.md`: adding projects/experiments/tools/milestones, bilingual routing, search index, snapshot maintenance, UI review, Cloudflare deployment checklist.
- `docs/data-sources.md`: asset sources, logo/screenshot retrieval dates, and why unused assets were rejected.

## Data integrity and limitations

- Every project, version, release and service status comes from verifiable public sources; no fake download URLs or releases are created.
- The status page is a low-frequency observation log, not an SLA, and makes no uptime guarantee; missing snapshots stay unknown.
- The blog is linked and summarized from snapshots; article bodies live on the blog site.
- Local builds, Lighthouse and Playwright results do not represent production; verify separately in the deployed environment.
- This is a personal site project; it offers no multi-user features, comments or admin backend.
