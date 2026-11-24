import type { Lang } from '../types/domain';

export interface ContentTranslation {
  category?: string;
  tagline?: string;
  description?: string;
  features?: string[];
  architecture?: string[];
}

export const projectTranslations: Record<Lang, Record<string, ContentTranslation>> = {
  zh: {
    'ai-devops': {
      category: 'AI 工程',
      tagline: '串联需求、代码、测试、缺陷与发布的 AI 平台。',
    },
    'algorithms-archive': {
      category: '算法题库',
      tagline: '49 篇精简 LeetCode 题解：题目、思路、答案。',
    },
    autotest: {
      category: '测试自动化',
      tagline: '带 Vue 控制台与 SSE 日志的 pytest 移动端测试框架。',
    },
    bigboom: {
      category: '日志分析',
      tagline: '面向嵌入式设备压测日志的 PyQt6 分析工具。',
    },
    'block-world-3d': {
      category: '沙盒游戏',
      tagline: 'Three.js 构建的类 Minecraft 体素沙盒。',
    },
    'code-quality-check': {
      category: 'Agent 技能',
      tagline: '自动 lint 并加入 AI 审查与评分的 Agent 技能。',
    },
    devbox: {
      category: '开发者工具箱',
      tagline: '本地优先的浏览器开发者工具箱，21 个实用工具。',
    },
    'echo-space': {
      category: '音频播放器',
      tagline: '部署在 Cloudflare 上的场景化沉浸音频播放器。',
    },
    fortune: {
      category: 'AI Web 应用',
      tagline: '基于 GPT 与 Cloudflare Workers 的命理推演应用。',
    },
    'halo-music': {
      category: '音乐',
      tagline: '跨网页、桌面与 Android 的多音源音乐流媒体。',
    },
    'happy-games-skill': {
      category: 'Agent 技能',
      tagline: '为 happy_games 脚手架并登记新小游戏的 Agent 技能。',
    },
    'happy-games': {
      category: '浏览器游戏厅',
      tagline: '24 款零构建的原生 JavaScript 浏览器游戏。',
    },
    'interview-atlas': {
      category: '内容流水线',
      tagline: '自动采集并索引 47k+ 中文技术面经。',
    },
    'kaoyan-workbench': {
      category: '学习工作台',
      tagline: '为考研备考打造的 Vite 多页工作台。',
    },
    micromd: {
      category: 'Markdown 阅读器',
      tagline: 'Windows 上约 3 MB 的单文件 Markdown 阅读器。',
    },
    nanoapi: {
      category: '开发者工具',
      tagline: '面向日常 API 调试的轻量桌面客户端。',
    },
    nanobrowser: {
      category: '浏览器与自动化',
      tagline: '带无头 CLI 与 MCP 自动化的轻量桌面浏览器。',
    },
    nanodb: {
      category: '数据库',
      tagline: '提供 CLI 与 REST 访问的嵌入式文档数据库。',
    },
    nanohermes: {
      category: 'AI Agent',
      tagline: '面向终端、桌面与守护进程的轻量编程智能体。',
    },
    nanoqa: {
      category: '质量保障',
      tagline: '覆盖完整测试生命周期的协同平台。',
    },
    nanossh: {
      category: '网络工具',
      tagline: '专注、克制的 Windows SSH 客户端。',
    },
    'pvz-web': {
      category: '塔防游戏',
      tagline: '原生 JS 打造的 60 关植物大战僵尸同人游戏。',
    },
    'serial-log-agent': {
      category: 'AI 日志分析',
      tagline: '规则、专家技能与大模型结合的 DeepSeek 串口日志分析。',
    },
    shuge: {
      category: '知识库',
      tagline: '构建在 Cloudflare 上的无服务器中文 RAG 知识库。',
    },
    'stack-frame': {
      category: '个人博客',
      tagline: '「尘世栈帧」博客：Vue 3 + Django 前后端分离自托管。',
    },
    'test-manage-system': {
      category: '测试管理',
      tagline: '面向完整测试生命周期的 Vue 3 + Django QA 平台。',
    },
    'trip-planning': {
      category: 'AI 旅行规划',
      tagline: '流式生成地理校验行程的 AI 旅行规划器。',
    },
    'z-bot': {
      category: '个人 AI',
      tagline: 'Windows 上的本地优先私人 AI 助理。',
    },
    'z-desktop': {
      category: 'AI 工作台',
      tagline: '面向真实电脑任务的 AI 原生 Windows 工作台。',
    },
    'z-memory': {
      category: 'AI 基础设施',
      tagline: '面向 AI Agent 的本地优先结构化记忆基础设施。',
    },
  },
  en: {
    'ai-devops': {
      description:
        'An AI work platform that understands the full delivery chain — requirements, code, tests, bugs, releases and production incidents. It syncs GitHub repositories and webhook events, links commits, modules, requirements, test cases, defects and releases, computes a decomposable risk score from ten signals, and ships five built-in AI agents for impact analysis and root-cause investigation.',
      features: [
        'Incremental GitHub sync and real-time webhook ingestion',
        'An explain endpoint returns the full linked chain for any commit',
        'Ten-signal risk engine with a per-item score breakdown',
        'Pluggable AI providers and five built-in agents',
        'Evidence checks: AI citations must map to real data',
        'A fixed executor runs approved actions and writes an audit trail',
      ],
      architecture: [
        'Django split into ten domain applications',
        'Celery handles sync and AI analysis asynchronously',
        'Risk weights inherit across system, organization and project levels',
        'Multi-tenant queries go through scoped filtering',
        'Models only see read-only tools filtered by project',
        'docker compose orchestrates web / worker / beat / db / redis',
      ],
    },
    'algorithms-archive': {
      description:
        'A focused collection of algorithm write-ups extracted from the lc-* series on the blog. Each entry keeps only the problem, the idea and the answer, dropping animation notes and interview patter. 49 write-ups cover 56 problems across 15 topics, with 48 Python and 47 Java solutions checked line by line against the originals.',
      features: [
        '49 write-ups covering 56 problems',
        '15 topic groups including design, linked lists, trees, graphs and dynamic programming',
        'A fixed three-part structure: problem, idea, answer',
        'Multi-solution problems split by approach with complexity notes',
        'Every write-up links back to the original blog post',
      ],
      architecture: [
        'Solutions live as standalone Markdown files under problems/',
        'README acts as the table of contents and difficulty index',
        'Content is extracted from blog posts with surrounding material removed',
      ],
    },
    autotest: {
      description:
        'A mobile test automation framework built on pytest, paired with a Vue 3 + Vite web console. Pick scripts in the Testbed and run them remotely in a batch; logs stream over SSE, reports are written locally and stay browsable, and the whole batch sends exactly one summary email.',
      features: [
        'Select scripts in the Testbed and run batches remotely',
        'SSE streams output and per-script completion events',
        'Browsable report history, detail views and live refresh',
        'Unified storage for devices, phones and test configurations',
        'Pretest environment checks that can install missing dependencies',
        'One HTML summary email per batch',
      ],
      architecture: [
        'Vite frontend scans scripts; a Node service invokes pytest',
        'Express starts pytest processes one by one and pushes SSE',
        'Reports are grouped by batch and merged from pytest-json-report',
        'Appium is wrapped with startup checks',
        'One batch at a time, sharing a single email session',
      ],
    },
    bigboom: {
      description:
        'A PyQt6 desktop tool for analyzing embedded-device stress-test logs. It extracts key prints with configurable regexes, detects loop boundaries and success rates, measures key intervals and flags timeouts, and scans abnormal behavior by test category. Results export to PDF and Excel.',
      features: [
        'Key-print detection and loop-boundary recognition with success rates',
        'Paired start/end regexes for key intervals and timeout flags',
        'Scan abnormal keywords and behavior by test category',
        'Dedicated power-cycle analysis with battery and voltage charts',
        'Batch analysis and live monitoring across multiple devices',
        'Watermarked PDF and multi-sheet Excel reports',
      ],
      architecture: [
        'GUI and analysis engine live together in log_key_info_analize.py',
        'Detection rules are external JSON files under config/, editable in the UI',
        'matplotlib draws inside Qt; reportlab and openpyxl handle export',
        'Complete loop excerpts are written to the output directory',
        'PyInstaller packages a console-free Windows executable',
      ],
    },
    'block-world-3d': {
      description:
        'A Minecraft-like voxel sandbox in plain JavaScript, rendered with Three.js and no game engine. It includes procedural terrain, three dimensions, a survival loop, redstone circuits, a villager economy and boss fights. Cloudflare Pages hosts the browser build; Electron + SQLite provides local desktop saves.',
      features: [
        'Procedural terrain, three dimensions and 17 region structures',
        'Health, hunger, oxygen, tools and 325 crafting recipes',
        'Redstone wire, repeaters, comparators, pistons and dispensers',
        '40 hostile mobs, 20 animal types and two bosses',
        'Dual saves in local SQLite and Cloudflare D1',
        '40+ automated and performance-budget regression tests',
      ],
      architecture: [
        'Three.js handles rendering; block meshes merge per chunk',
        'Chunk terrain is pre-generated in Web Workers',
        'A desktop bridge abstracts browser, Electron and test environments',
        'Terrain, biome and structure generation stay separate',
        'The cloud stores save snapshots only; rendering stays client-side',
      ],
    },
    'code-quality-check': {
      description:
        'A two-stage code analysis skill: a scan script identifies languages, counts files and runs available linters, then AI reviews security, correctness and maintainability in depth. It scores five weighted dimensions and returns a Markdown report with file:line locations and priority order.',
      features: [
        'Detect languages and run available lint tools',
        'AI review of security, correctness and maintainability',
        'Five weighted dimensions and an A–F grade',
        'Findings locate file:line and sort by priority',
        'Read-only by default; never edits code',
        'Hard-coded secrets are reported by location and type only',
      ],
      architecture: [
        'SKILL.md defines the scan → fill tooling gaps → AI review → report flow',
        'scripts/scan.py handles scanning and lint orchestration',
        'references/ holds scoring rules and report templates',
        'Trigger phrases invoke it; reusable inside an agent',
      ],
    },
    devbox: {
      description:
        'A browser-based developer toolbox built with Vue 3, TypeScript and Vite. Its 21 tools cover JSON, encoding, security, networking, time, text and generators. No login; core computation stays local, and any outbound request is labeled in the UI.',
      features: [
        'JSON, SQL, Markdown and text-diff tools',
        'Base64, URL, Hash, HMAC and JWT utilities',
        'CIDR, DNS, IP, Ping and network diagnostics',
        'Timestamps, Cron, regex, UUID and QR codes',
        'AI code-style detection from paste, files or a repository',
        'Light/dark themes, a search dialog and PWA offline caching',
      ],
      architecture: [
        'A single ToolDefinition registry drives routes and search',
        'Tool pages and editor language packs lazy-load by route',
        'Regex and Markdown previews enforce escaping and length limits',
        'vite-ssg pre-renders pages with per-page SEO metadata',
        'Static _headers provide CSP and other security headers',
      ],
    },
    'echo-space': {
      description:
        'An immersive audio player on Cloudflare Pages that organizes content by scene, with playlists for silent meditation, jump rope, running and hiking. The frontend is vanilla HTML/CSS/JavaScript; Pages Functions and D1 store accounts, sessions, playback history and cloud playlists.',
      features: [
        'Four scene playlists: silence, jump rope, running and hiking',
        'Single, sequential, shuffle and repeat playback',
        'Breathing guidance for silence scenes and focus timers',
        'Auto-build a playlist from a chosen duration with voice cues',
        'Accounts, cloud playlists and playback history',
        'A profile page with total sessions, time and scene distribution',
      ],
      architecture: [
        'Vanilla frontend hosted statically on Cloudflare Pages',
        'Functions expose account, history, search and playlist APIs',
        'D1 stores accounts, sessions, history and playlists',
        'Playback duration indexes are pre-generated from local audio at deploy time',
        'JOOX search is proxied server-side with auth and rate limiting',
      ],
    },
    fortune: {
      description:
        'A fortune-telling app powered by GPT and Cloudflare Workers, with a Vue 3 results page. Users submit birth details and focus areas through a step-by-step form; each reading consumes credits and returns a lucky color, personality projection, core analysis and actionable advice. D1 records users, credits and reading logs.',
      features: [
        'Step-by-step form for birth details, lucky color, season and focus',
        'Results page with glassmorphism, dynamic color and share cards',
        'Readings return a lucky color, resonance score, keywords, personality and advice',
        'Email verification grants credits; each successful reading deducts them',
        '/health reports model and D1 status',
      ],
      architecture: [
        'One Worker handles routing, CORS, validation, model calls and D1 logs',
        'The system prompt forces a JSON schema; non-compliant output retries once',
        'Credits use an atomic conditional UPDATE; reading logs write asynchronously',
        'API keys arrive through wrangler secrets; responses set no-store',
        'Frontend build output ships as Worker static assets',
      ],
    },
    'halo-music': {
      description:
        'An online music application built on Cloudflare Pages, Pages Functions and D1, with an Electron desktop client and an Android WebView client. Multiple upstream sources normalize into the HALO Track model, supporting search, playback, lyrics, favorites, playlists and offline management.',
      features: [
        'Deduplicated and interleaved results across multiple sources',
        'Multiple playback modes with synchronized LRC lyrics',
        'Volume fade-out when the sleep timer ends',
        'Web picture-in-picture and transparent desktop lyrics in Electron',
        'Unified offline management for downloads and local audio',
        'Synced favorites, user playlists and listening history',
        'Public playlist links and HALO JSON import',
      ],
      architecture: [
        'Browser and Electron reuse the same Pages frontend',
        'Pages Functions handle auth, caching and audio resolution',
        'A source adapter layer normalizes fields from different upstreams',
        'D1 stores accounts, user libraries and a shared cache',
        'localStorage and IndexedDB provide local data features',
        'Electron isolates desktop capabilities behind a minimal preload',
      ],
    },
    'happy-games-skill': {
      description:
        'An “add a new mini-game” skill pack for happy_games. The agent follows existing conventions — vanilla HTML/CSS/JS, zero build, separated logic and rendering, runtime telemetry, a data-driven landing page — from scaffold to registration and acceptance. It includes a minimal game template, a unit-test template and three reference documents.',
      features: [
        'One command generates the game skeleton, tests and an SVG icon',
        'Rules live in pure logic.js functions, ready for unit tests',
        'Reuses shared theme, game and accessibility assets',
        'Wires into the common lifecycle telemetry',
        'Guides all five registration points',
        'Provides a complete acceptance path',
      ],
      architecture: [
        'SKILL.md defines requirements, scaffold, logic, wiring, registration and validation',
        'references/ splits conventions, registration and testing docs',
        'scripts/new-game.mjs creates directories and replaces template placeholders',
        'assets/game-template is a runnable minimal example',
        'The scaffold generates files but never rewrites site configuration automatically',
      ],
    },
    'happy-games': {
      description:
        'A browser game hall written in vanilla HTML / CSS / JavaScript, with 24 games across four sections and no framework, bundler or dependencies. Board games have computer opponents, Ludo uses D1 for real-time multiplayer, and Life Simulator and Chinese History Brawl stream narratives from large language models.',
      features: [
        '24 games across board, puzzle, entertainment and Chinese history sections',
        'Gomoku, Chinese chess and a WebAssembly build of GNU Go',
        'Ludo multiplayer rooms with AI fill-ins',
        'Streaming life narratives and historical battle reports from LLMs',
        'Accounts and an admin console',
        '25 Node test files plus Playwright smoke tests',
      ],
      architecture: [
        'Every game is self-contained; logic is DOM-free pure functions',
        'shared/landing.js is the single source for the landing page and sections',
        'Pages Functions access D1 in layers; room state is serialized',
        'The whole site publishes with zero build and layered static caching',
      ],
    },
    'interview-atlas': {
      description:
        'A GitHub Actions pipeline that automatically collects Chinese tech interview reports from Nowcoder, Mianshiya and Juejin, splits them by company and role, and renders a searchable interview atlas. The README records 47,322 reports across 158 companies and 1,669 company-role files; each entry keeps its original link, and GitHub Models generates analysis reports.',
      features: [
        'Automatically collect public interview reports from three platforms',
        'Split Markdown by company and role while preserving original links',
        'Group into 16 role categories with source distribution stats',
        'Daily incremental and weekly full runs',
        'Company-role and role analyses generated with GitHub Models',
      ],
      architecture: [
        'A Python package layered into sources, normalize, storage, render and analyze',
        'config.yaml controls output directory, retention days and sources',
        'data/interviews stores JSON sharded by company',
        'Two workflows handle daily increments and weekly full runs',
        'Analysis prompts carry version numbers so regeneration can be forced',
      ],
    },
    'kaoyan-workbench': {
      description:
        'A study workbench for postgraduate entrance-exam candidates. It is a Vite multi-page app with cloud data, so signing in on a new device resumes where you left off. Seven modules cover Today, Plan, Focus, Scores, Review, Resources and Settings; charts are hand-written SVG and white noise is synthesized live with Web Audio.',
      features: [
        'Today: countdown, schedule and check-ins',
        'Plan: weekly calendar, task board and Gantt chart',
        'Focus: multi-length Pomodoro timer with live white noise',
        'Scores: accuracy curves and mock-exam trends',
        'Review: streak calendar, streak days and study timeline',
        'Resources, target schools and daily goals',
      ],
      architecture: [
        'Vite multi-page build with eight HTML entries sharing modules',
        'All charts are hand-written SVG with no chart library',
        'White noise is synthesized in real time with the Web Audio API',
        'Eleven cloud tables enforce row-level isolation by owner_id',
        'Narrow screens switch to a bottom tab bar with fixed 16px inputs',
      ],
    },
    micromd: {
      description:
        'A single-file Markdown reader for Windows at around 3 MB: a native Win32 window plus a WebView2 shell, with a zero-dependency HTML interface that renders entirely offline. It offers live split preview, three layouts, light/dark themes, autosaved drafts and throttled rendering for large files.',
      features: [
        'Live split preview with a draggable divider and sync scrolling',
        'Split, preview-only and edit-only layouts',
        'Theme follows the system, with a manual override',
        'Autosaved drafts, word count and reading time',
        'Throttled rendering above 200 KB',
        'Raw HTML is escaped and dangerous links are dropped',
      ],
      architecture: [
        'main.go provides the Win32 window, WebView2 shell and native file dialogs',
        'web/index.html holds both the interface and a hand-written Markdown parser',
        'Page assets embed in the exe and extract to a local directory on first run',
        'Documents opened by CLI or drag-and-drop write back to the original file',
        'release.yml builds and publishes the exe and SHA256 on tag pushes',
      ],
    },
    nanoapi: {
      description:
        'A lightweight API testing tool for Windows that keeps the everyday essentials: request building, collections, environment variables, response inspection and cURL conversion. No account or cloud sync; collections and settings live in local JSON files.',
      features: [
        'Request tabs keep independent state and restore after restart',
        'Unified collection tree, environment and global variables',
        'Multiple body types, auth methods and file uploads',
        'cURL import/export and response body saving',
        'Response headers, image previews and timing breakdowns',
      ],
      architecture: [
        'Wails and the system WebView2 provide the desktop window',
        'A Go backend handles network requests and file operations',
        'Native ES Modules drive editing and UI rendering',
        'Local JSON uses temp files and atomic rename writes',
      ],
    },
    nanobrowser: {
      description:
        'A Windows desktop browser built on Tauri 2 and the system WebView2, plus nanoagent for headless automation. The visible browser, headless CLI and MCP service share an in-process DevTools Protocol bridge, so no remote debugging port needs to be exposed.',
      features: [
        'Tabs, bookmarks, history and downloads in a desktop browser',
        'Built-in DevTools docked at the bottom or right',
        'Headless CLI navigation, clicking, typing and screenshots',
        'MCP over stdio for AI tool integration',
        'Network capture redacts sensitive data at collection time',
      ],
      architecture: [
        'Desktop browser and nanoagent share a Rust library',
        'The in-process CDP bridge calls WebView2 COM directly',
        'Browser shell, pages and DevTools use child WebViews',
        'Capabilities are permissioned per WebView type',
        'MCP and one-shot CLI share the same automation browser',
      ],
    },
    nanodb: {
      description:
        'A lightweight embedded document database written in Go. Its data model is JSON documents and collections, with no external service. It embeds in Go programs and is also available through a one-shot CLI, an interactive shell and a REST service, for small and medium local datasets.',
      features: [
        'Document queries with sorting, pagination and field projection',
        'Secondary indexes for equality, range and array queries',
        'Text indexes, geospatial indexes and aggregation pipelines',
        'Read-only SQL queries and atomic batch writes',
        'Explicit transactions with snapshot reads and commit conflict detection',
        'CLI, interactive shell and REST cover the core feature set',
      ],
      architecture: [
        'A Go embedded core manages collections and documents',
        'Snapshots and a WAL provide persistence and crash recovery',
        'The query planner reuses filtering, index and sorting implementations',
        'CLI, shell and REST share the same database core',
        'An OS-level lock limits the data directory to one process',
      ],
    },
    nanohermes: {
      description:
        'A low-memory coding agent written in Rust. It connects to OpenAI Chat Completions-compatible model endpoints and provides file, search, shell, patch, Git and MCP tools. The project includes a terminal CLI, a Tauri desktop app and an HTTP daemon for remote task execution.',
      features: [
        'One-shot commands and an interactive REPL in the terminal',
        'Built-in file editing, code search, shell and Git tools',
        'Desktop workspace management and remote daemon tasks',
        'MCP tools, resources and prompts',
        'Sub-agents, skills, long-term memory and session restore',
        'File sandboxing, approval policies and Linux Landlock confinement',
      ],
      architecture: [
        'The agent crate carries the CLI, tool loop, MCP and daemon',
        'The Tauri frontend uses React and TypeScript',
        'Local tasks run in-process; remote tasks forward to the daemon',
        'Blocking HTTP and bounded tool output keep resource use in check',
        'Sessions, settings and long-term memory stay in a local directory',
      ],
    },
    nanoqa: {
      description:
        'A test collaboration platform built around requirements, test cases, plans, execution, defects and reports, with versioned cases, role permissions and audit logs. AI features currently run only through a MockProvider stub: generated drafts enter a human review queue and no real model is connected.',
      features: [
        'Requirements link to test cases and show coverage',
        'Case module tree, step editing and version snapshots',
        'Test plans, execution rounds and shortcut-driven result submission',
        'A defect state machine linked to cases, runs and requirements',
        'ECharts reports plus CSV and XLSX import/export',
        'AI drafts use MockProvider only and require human review',
      ],
      architecture: [
        'The Vue frontend goes through a unified API client',
        'Django and DRF are split into business-domain apps',
        'JWT auth combines with a role-permission matrix',
        'PostgreSQL persists business data and audit records',
        'Redis is optional for caching and rate limiting',
        'An AITask review queue isolates MockProvider drafts',
      ],
    },
    nanossh: {
      description:
        'A deliberately narrow Windows SSH client focused on servers, terminals, SFTP, local port forwarding and SSH key management. Configs and keys stay on the machine; passwords and private-key passphrases are protected by Windows Credential Manager, with no cloud account required.',
      features: [
        'xterm.js terminal with WebGL rendering and full-screen programs',
        'SFTP browsing, uploads, downloads and file management',
        'Local port forwarding cleaned up with its session',
        'Password, private key and Windows ssh-agent authentication',
        'Generate and import ed25519 keys',
        'TOFU known_hosts with a hard block on fingerprint changes',
      ],
      architecture: [
        'The sshcore kernel has no dependency on UI code',
        'The Wails shell opens channels over the same SSH connection',
        'Binary WebSocket IPC with ack backpressure carries terminal bytes',
        'A worker decodes bytes and hands them to xterm.js',
        'Local JSON and Windows Credential Manager separate config from secrets',
      ],
    },
    'pvz-web': {
      description:
        'A zero-dependency Plants vs. Zombies fan game in vanilla JavaScript and Canvas 2D — double-click index.html and play. Adventure mode has 60 levels, plus Vasebreaker, I, Zombie and endless survival, with 24 plants and 16 zombie types. The author is unaffiliated with PopCap Games / EA; assets remain with their original rights holders.',
      features: [
        '60 adventure levels across six themed chapters',
        '24 plants and 16 zombie types',
        'Vasebreaker, I, Zombie and endless survival modes',
        'Sun economy, wave attacks and card cooldowns',
        'Water, roof, gravestone and other terrain mechanics',
        'Local progress saving with legacy-save migration',
      ],
      architecture: [
        'A single game.js carries rendering, AI, levels and mode logic',
        'A 1280×720 Canvas driven by one requestAnimationFrame loop',
        'A dual pipeline for GIF assets and procedural animation',
        'Multiple fallback sources for assets',
        'Test hooks let Playwright inject level state',
      ],
    },
    'serial-log-agent': {
      description:
        'A DeepSeek-based serial-log analysis tool with a three-stage pipeline: rule scanning, expert Skills and LLM context linking. An AI agent turns the result into a structured bug report. Analyses persist to a database and accept human verdicts, which are injected into later runs as historical experience.',
      features: [
        'Built-in rules for crashes, memory, storage, power/thermal and severity',
        'Rule hits trigger four expert Skills with structured verdicts',
        'LLM timeline linking and a risk TOP 3',
        'Human verdicts write back and inform later analysis',
        'Automatically extracts matching rules from stress-test case sheets',
        'Desktop, web and live serial-monitor entry points',
      ],
      architecture: [
        'The pipeline advances through cleaning, rules, Skills, LLM, merge and summary',
        'Rule compilation and matching are independent of Skill scheduling',
        'User rules and Skills live as JSON under config/',
        'PostgreSQL is optional; persistence is skipped when unset',
        'Serial data is anomaly-checked online by an LSTM before analysis',
      ],
    },
    shuge: {
      description:
        'A Chinese RAG knowledge base built entirely on Cloudflare, supporting PDF, Office, Markdown, web pages and GitHub repositories. Uploaded documents are parsed, chunked, vectorized and keyword-indexed automatically. Retrieval fuses vectors with BM25, and streamed answers include page-level citations.',
      features: [
        'Multi-format document parsing plus web, GitHub and RSS imports',
        'Vectorize semantic search and a custom BM25 inverted index',
        'RRF fusion followed by vector, keyword-coverage and structure reranking',
        'Three chat modes with SSE-streamed, cited answers',
        'Owner / editor / viewer membership roles',
        'Model and prompt version management with audit logs',
      ],
      architecture: [
        'Pages Functions mount Hono routes; D1 stores business data and R2 stores files',
        'waitUntil runs parsing, chunking, vectorization and indexing asynchronously',
        'BM25 uses a D1 inverted index instead of SQLite FTS5',
        'Passwords use salted PBKDF2; JWTs pair with rotating refresh tokens',
        'Retrieval checks for prompt injection and preserves citations',
      ],
    },
    'stack-frame': {
      description:
        'Frontend and backend source for the 尘世栈帧 personal blog: a Vue 3 SPA on GitHub Pages and a Django + DRF + SQLite backend on PythonAnywhere, communicating over a REST API. It includes Markdown writing, nested comments, full-text search, a photo wall, a map footprint, RSS and PWA support.',
      features: [
        'Markdown writing with the Vditor online editor',
        'Nested comments and honeypot spam protection',
        'Backend full-text search with highlighted results',
        'Photo wall, lightbox and an ECharts map footprint',
        'RSS subscription and email notifications for new posts',
        'Admin console and PWA offline caching',
      ],
      architecture: [
        'GitHub Pages hosts the Vue SPA; PythonAnywhere runs Django',
        'The backend splits models / views / signals by app',
        'Pinia manages auth and article state; routes use auth guards',
        'Build output goes to root assets/ and is served by GitHub Pages',
        'Dual themes remember preference; a service worker caches offline',
      ],
    },
    'test-manage-system': {
      description:
        'An internal test management platform for QA teams, unifying case design, test plans, execution tracking and defect management with multi-project collaboration and fine-grained role permissions. The case library is organized by product line and supports batch assignment, approval, attachments and Excel import.',
      features: [
        'Case library by product line with priority and status filters',
        'Case assignment, batch status updates and approval',
        'Test plans and execution items generated automatically',
        'S0–S4 defects with state transitions',
        'Dashboard stats for projects, cases, plans and defect distribution',
        'Admin user management and fine-grained permissions',
      ],
      architecture: [
        'Django config + apps structure; DRF splits APIs by module',
        'JWT auth with 1-hour access and rotating 8-hour refresh tokens',
        'Vue 3 + Element Plus + Pinia + Vue Router',
        'Core entities include the module tree, cases, plans, execution and defects',
        'Excel import runs through a Django management command',
      ],
    },
    'trip-planning': {
      description:
        'An AI travel-planning workbench for Cloudflare Pages, also available as a WeChat mini program. After users choose a city, duration, budget and pace, the server calls the model in chunks and streams a geo-validated day-by-day itinerary over SSE.',
      features: [
        '2–16 day itineraries across up to 8 cities, scheduled by day',
        'Long trips generated in parallel four-day chunks with live SSE progress',
        'Per-day geographic validation and backtracking detection',
        'Timeline, map pins, poster image and PDF export',
        'Three-language interface with currency switching',
        'Login, credits, invite rewards and trip history',
      ],
      architecture: [
        'Pages Functions expose /api/*; D1 stores users, sessions, trips and credit ledgers',
        'Chunk prompts include the full city schedule; results merge and sort by day',
        'Model output is forced to JSON; failures retry with the rejection reason added',
        'Successful generations atomically charge credits and write a ledger entry',
        'Passwords use PBKDF2-SHA256 hashing; sessions travel in HttpOnly cookies',
      ],
    },
    'z-bot': {
      description:
        'A local-first personal AI assistant for Windows that organizes conversations, long-term memory, projects, to-dos and reminders into personal context. Within granted permissions it can operate files, web pages and the browser; risky actions need human approval, and arbitrary shell access is not provided.',
      features: [
        'Multiple model providers plus local Ollama',
        'Five long-term memory types retrieved via SQLite FTS5',
        'To-dos, recurring reminders and stalled-project nudges',
        'File, web, browser and clipboard tools gated by permissions',
        'Native Windows OCR with optional vision-model fallback',
        'Quick Ask, screenshot shortcuts and system tray integration',
      ],
      architecture: [
        'The React renderer calls the main process through a typed preload',
        'The Electron main process owns the database, secrets and system capabilities',
        'Intent routing separates direct answers from multi-step agent loops',
        'A model adapter normalizes streaming events across providers',
        'The permission manager validates paths and scopes before tool execution',
        'SQLite and FTS5 store conversations, memories and personal tasks',
      ],
    },
    'z-desktop': {
      description:
        'A Windows desktop workbench connecting large-model planning with local execution. An agent can use file, shell, process, window, GUI, browser, screenshot and clipboard tools, while the Rust side enforces risk checks, path sandboxing and user approval.',
      features: [
        'Multi-provider model access with streamed task output',
        'Agent loop spanning planning, execution, observation and verification',
        '44 local tools across files, shell, GUI and browser',
        'Five-level risk model with approval for high-risk actions',
        'Task timeline showing steps, activity and results',
        'File management, project context and FTS5 long-term memory',
      ],
      architecture: [
        'A Vue frontend carries the agent state machine and model adapters',
        'Tauri IPC connects the frontend task flow to the Rust core',
        'A Rust registry defines and executes every local tool',
        'The security layer makes a permission decision before each run',
        'SQLite and FTS5 store tasks and long-term memory',
        'An event stream drives the activity panel and task timeline live',
      ],
    },
    'z-memory': {
      description:
        'Local-first infrastructure for AI memory, with a Windows desktop app and a JSON-emitting CLI. It turns persistent information from interactions into structured, sourced memories, retrieves them through hybrid keyword and local semantic vectors, and supports deduplication, conflict handling, audit and full import/export.',
      features: [
        'Desktop app and JSON CLI share one local database',
        'Offline rule-based extraction with optional compatible models',
        'Memory candidates support review, dedupe, reinforcement and conflict resolution',
        'Hybrid retrieval with FTS5 BM25 and local vectors',
        'Source excerpts, score breakdowns and event timelines for explanations',
        'Archive, expiry, deletion and multi-format import/export',
      ],
      architecture: [
        'Vue and Pinia call Tauri IPC through a typed service layer',
        'The Rust core owns extraction, retrieval and lifecycle',
        'Desktop UI and CLI reuse the same memory service',
        'SQLite stores memories, sources, events and audit data',
        'FTS5 and local vectors fuse and rank in Rust',
        'Credential protection, trust levels and human review constrain data entry',
      ],
    },
  },
};

export interface ToolTranslation {
  category?: string;
  description?: string;
}

export const toolTranslations: Record<Lang, Record<string, ToolTranslation>> = {
  zh: {
    'block-world-3d': { category: '3D 沙盒' },
    'echo-space': { category: '音频与专注' },
    'halo-music': { category: '音乐' },
    'happy-games': { category: '浏览器游戏' },
    'trip-planning': { category: 'AI 旅行' },
  },
  en: {
    'block-world-3d': {
      description:
        'A Minecraft-like voxel sandbox in the browser. Full survival play requires the Electron desktop build.',
    },
    'echo-space': {
      description:
        'An immersive audio player organized into four scenes: silence, jump rope, running and hiking.',
    },
    'halo-music': {
      description:
        'Multi-source search, streaming playback, synchronized lyrics, favorite playlists and offline management across web and desktop.',
    },
    'happy-games': {
      description:
        '24 zero-dependency browser games, playable instantly. Board games include computer opponents and Ludo supports online rooms.',
    },
    'trip-planning': {
      description:
        'Choose cities, days, budget and pace to generate a day-by-day itinerary with map pins and budget, exportable as a poster or PDF.',
    },
  },
};
