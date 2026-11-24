# ZHOUJUN.DEV / Z OS v1.0

[中文](./README.md) | [English](./README.en.md)

ZhouJun 的个人数字门户。站点以 Astro 静态生成，用 Vue 3 岛屿提供搜索、筛选、菜单与主题切换，展示 30 个真实应用、公开动态、博客入口、工具与服务观测记录。全站双语：中文位于根路径，英文位于 `/en/`。视觉采用纸张、墨色与朱红的印刷 / 编辑式语言，深色为默认主题。

线上地址：<https://zhoujun.dev>

## 目录

- [概览](#概览)
- [架构总览](#架构总览)
- [技术栈](#技术栈)
- [功能详解](#功能详解)
- [页面与路由](#页面与路由)
- [目录结构](#目录结构)
- [本地开发](#本地开发)
- [脚本](#脚本)
- [内容模型](#内容模型)
- [数据快照与同步](#数据快照与同步)
- [测试与质量](#测试与质量)
- [CI / CD](#ci--cd)
- [设计系统](#设计系统)
- [故障排查](#故障排查)
- [文档](#文档)
- [数据诚信与限制](#数据诚信与限制)

## 概览

- **30 个应用**，分为六个家族：
  - `Nano/` 轻量桌面工具与开发基础设施；
  - `Z/` 本地优先 AI 助理、记忆与智能体；
  - `Halo/` 音乐、声音与沉浸式体验；
  - `Cloud/` Cloudflare 与 Web 原生产品；
  - `Play/` 游戏、3D 世界与趣味实验；
  - `Craft/` 工程效率、质量保障与知识整理。
- 当前 **17 个已发布、13 个开发中**，**8 个首页精选**。
- **静态输出**：构建只读仓库内的快照文件，不访问外网；页面 HTML 可离线生成，部署产物可任意托管。
- **双语共享实现**：同一页面只写一份（`src/views/`），`src/pages/` 与 `src/pages/en/` 只保留传 `lang` 的路由包装。
- **交互按需水合**：总览、统计、命令面板、主题切换、移动端菜单等以 Vue 岛屿实现，其余内容为纯 HTML。
- **数据诚实**：项目版本与 Release 来自 GitHub 快照；状态页呈现低频观测而不宣称 SLA；缺少可靠素材时隐藏模块，不伪造 Logo 或截图。

## 架构总览

```text
内容 JSON ──┐
快照 JSON ──┼─> Astro Content Collections / Zod 校验
配置 TS   ──┘            │
                         ├─> src/views（共享页面实现）
                         ├─> src/pages（中英路由包装）
                         ├─> src/pages/*/search-index.json.ts（按语言生成索引）
                         │
                         └─> astro build ─> dist/
                                              ├─ HTML（双语、无 JS 可读）
                                              ├─ _headers（CSP / 缓存）
                                              ├─ sitemap-index.xml
                                              └─ 静态资源（本地字体、图片）

运行时：Vue 岛屿（搜索 / 筛选 / 菜单 / 主题） + MiniSearch 索引（首次打开命令面板时加载）
```

构建阶段完成所有内容读取、Zod 校验、i18n 合并、排序与索引生成；运行时没有服务端，也不发起数据请求。

## 技术栈

| 层       | 选型                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 框架     | Astro 7，`output: 'static'`，悬停预取（`prefetch: hover`）                 |
| 交互     | Vue 3 岛屿（`@astrojs/vue`）、MiniSearch 7                                 |
| 语言     | TypeScript（严格模式）、Zod 4 内容 schema                                  |
| 样式     | Tailwind CSS v4 + `src/styles/global.css` 设计 Token                       |
| 字体     | `@fontsource` 本地自托管：Inter Variable、Instrument Serif、JetBrains Mono |
| 测试     | Vitest（单元）、Playwright（E2E）、`@axe-core/playwright`                  |
| 构建脚本 | `tsx` 运行 `scripts/` 下的同步与探测脚本                                   |
| 部署     | Cloudflare Pages（Direct Upload）+ GitHub Actions                          |

引擎要求：Node.js `>=22`（CI 使用 22）。

## 功能详解

### 双语内容与路由

- 中文在 `/`、`/projects` 等根路径；英文统一加 `/en` 前缀。路径工具集中在 `src/i18n/index.ts`：
  - `localizePath()` 生成对应语言路径；
  - `stripLangPrefix()` 去掉 `/en`；
  - `switchLangPath()` / `counterpartPath()` 生成另一语言地址；
  - 路径会规范化末尾斜杠与缺失的前导 `/`。
- 语言切换链接在页面加载时由内联脚本补上当前查询参数与锚点；切换后仍停留在同一内容。
- 输出本地化元数据：`<html lang="zh-CN|en">`、`og:locale`（`zh_CN` / `en_US`）、canonical、`hreflang`（`zh-CN`、`en`、`x-default` 指向中文）。
- 文案分三层：
  1. `src/i18n/ui.ts`：界面文案，`zh` 与 `en` 必须键对键齐全，单测会遍历 `en` 检查空值；
  2. `src/i18n/content.ts`：项目与工具的内容覆盖层，按内容文件名索引，缺失时回退到 JSON 原值；
  3. 内容 JSON：真实资料，不因语言复制两份。
- 中文排版策略：中文没有真正的斜体，`:lang(zh)` 下 `em`、`.serif`、`.eyebrow` 等强制直立；斜体衬线只用于拉丁文。
- 日期使用 `Intl.DateTimeFormat`，固定 UTC 时区，中英各用 `zh-CN` / `en-US`。

### 搜索与命令面板

- 构建时为每种语言生成索引：`/search-index.json` 与 `/en/search-index.json`。
- 索引包含：8 个固定页面、全部项目、Lab、Tools、以及最近 40 条动态。
- MiniSearch 配置：
  - 检索字段 `title`、`description`、`tags`、`keywords`；
  - 权重 `title: 4`、`tags: 2`、`keywords: 2`；
  - 开启前缀匹配；
  - 模糊匹配仅用于长度 ≥ 6 的纯小写字母数字词（`0.2`），避免 `rust` / `rest` 这类短词误命中；
  - 中文按整词 + 二元组扩展（如「桌面浏览器」也会生成「桌面」「面浏」「浏览」「览器」）；
  - 英文标识符拆分为 camelCase / 连字符 / 下划线 / 点号等片段，索引里 `NanoBrowser` 同时可被 `nano`、`browser` 命中；
  - 查询保持复合标识符完整，避免搜索 `NanoBrowser` 时命中所有 Nano 项目。
- 命令面板 `client:only="vue"`，首次打开才加载当前语言索引；提供快捷入口、键盘检索、方向键选择与 Escape 关闭；页头显示 `⌘ K` 或 `Ctrl K`。
- 搜索结果高亮最多 6 个词组，正则特殊字符会转义。
- 无 JS 时命令面板不可用，页面提供 `/search` 作为可分享查询的降级入口，并在 `noscript` 中说明。

### 项目索引与筛选

- 排序规则：`featured` 优先，其次 `displayOrder` 升序；精选数量变化时需同步检查首页文案与布局。
- 支持 URL 参数组合：`q`、`family`、`category`、`status`、`tech`，可独立追加或重置；参数值语言无关，标签随界面语言变化。
- 首页六个家族入口会预选对应 `family` 筛选。
- 项目卡与详情页都从同一内容源读取；详情页额外合并 GitHub 快照中的仓库信息与最新 Release。

### 动态与时间轴

- 动态来源三类：
  1. GitHub 各仓库最新 Release；
  2. 各仓库最近一次公开推送；
  3. `src/content/milestones/` 中人工确认的里程碑。
- 三类统一排序后展示；人工里程碑必须能与公开动态区分，并提供真实来源链接。
- 博客只链接到独立站点，不在本站复制文章正文；博客快照仅用于首页 / 动态的文章列表与摘要。
- `/timeline` 与 `/activity` 共用同一份动态数据，避免两处叙述不一致。

### 状态观测

- 只探测 `src/config/services.ts` 白名单：Blog、Music、Routewise、Happy Games、Block World 3D、Echo Space。
- 探测规则（`scripts/probe-status.ts`）：
  - 单次超时 10 秒；
  - 手动跟随重定向，最多 5 次，且只允许跳转到**白名单内的 https 同源地址**，否则记为故障；
  - 响应成功且 ≤ 3000ms 记为 `operational`，> 3000ms 记为 `degraded`，请求失败记为 `outage`；
  - 每次结果写入滚动 7 天历史，超出窗口的记录会被裁剪；
  - 无法确认时保留 `unknown`。
- 页面计算（`src/utils/status.ts`）：
  - 最近一次检查超过 26 小时视为过期，展示为 `unknown`；
  - 只有历史跨度至少 5 天且样本数 > 1 时才显示观测可用率，否则显示“数据收集中”；
  - `operational` 与 `degraded` 都计入可用样本。
- 状态是低频观测记录，不是 SLA，也不承诺完整可用率；页面必须保留这一表述。

### 主题与阅读体验

- 深色默认；`localStorage['z-os-theme']` 保存 `light` / `dark`，刷新后恢复。
- 首屏前内联脚本设置 `data-theme`，同步更新 `theme-color`，避免闪白 / 闪暗；脚本失败时回退深色。
- 滚动进度写入 CSS 变量 `--scroll-progress`，页头在滚动超过 10px 后进入紧凑状态。
- `[data-reveal]` 使用 IntersectionObserver 渐显；`prefers-reduced-motion` 或无 IntersectionObserver 时直接显示。
- 首页核心内容不依赖 JavaScript；跳过导航链接、可见焦点、语义化标题层级与 320px 起的响应式布局均在 E2E 中检查。

### SEO 与安全

- `Seo.astro` 输出 title、description、canonical、`hreflang` 三组、Open Graph、Twitter Card、可选 JSON-LD。
- Sitemap 由 `@astrojs/sitemap` 生成，过滤 `/search` 与 `/404`。
- 提供 `robots.txt`、`site.webmanifest`、favicon 与 Apple Touch Icon；默认 OG 图位于 `public/images/og-default.png`。
- `public/_headers` 定义：
  - `X-Content-Type-Options: nosniff`、`X-Frame-Options: DENY`、严格 Referrer 策略、最小权限策略；
  - CSP：默认同源，脚本 / 样式允许内联（首屏主题脚本所需），禁止对象与外部框架嵌套，强制 HTTPS；
  - `/_astro/*` 缓存 1 年且 immutable，`/images/*` 缓存 30 天。

## 页面与路由

| 路由                 | 说明                                                       |
| -------------------- | ---------------------------------------------------------- |
| `/`                  | 首页：Hero、统计、家族总览、精选项目、构建说明、开发者面板 |
| `/projects`          | 项目索引与多条件筛选                                       |
| `/projects/[slug]`   | 项目详情：简介、功能、架构、技术栈、仓库与 Release         |
| `/lab`               | 实验；无确认内容时保持空状态                               |
| `/tools`             | 真实可用的工具与站点（当前 5 个）                          |
| `/activity`          | 公开动态、Release 与代码更新                               |
| `/timeline`          | 人工里程碑与公开动态合并视图                               |
| `/status`            | 服务状态快照（低频观测）                                   |
| `/about`             | 关于、技术方向与工作原则                                   |
| `/search`            | 搜索页，支持 `?q=` 分享查询                                |
| `/search-index.json` | 当前语言搜索索引（构建时生成）                             |
| `/404`               | 未找到页面                                                 |

英文版本位于相同路径的 `/en/` 前缀下，索引为 `/en/search-index.json`。当前构建约 80 个页面。

## 目录结构

```text
src/
  assets/           构建期资源
  components/
    activity/       动态列表与条目
    common/         通用小部件
    home/           Hero、StatsGrid 等
    layout/         SiteHeader、SiteFooter、LanguageSwitch、Seo、ThemeToggle、MobileNavigation
    projects/       ProjectCard 等
    search/         CommandPalette（Vue）
    status/         状态卡片与历史
  config/
    site.ts         站点信息、导航、领域标签
    families.ts     六个家族的代码、名称、标语、颜色
    services.ts     状态探测白名单
  content/
    projects/       30 个项目 JSON
    lab/            实验（空）
    tools/          工具（5 个）
    milestones/     人工里程碑（空）
  content.config.ts 四个集合的 glob loader 与 Zod schema
  data/             github.json、blog.json、status.json
  i18n/             ui.ts、content.ts、index.ts
  layouts/          BaseLayout：字体、主题脚本、页头页脚、命令面板
  pages/            中文路由、/en 路由、搜索索引端点
  styles/           global.css：Token、排版、间距、语言样式策略
  types/            domain.ts：快照、项目、搜索文档等类型
  utils/            projects、search、search-index、activity、status、tools
  views/            双语言共享的页面实现
scripts/
  sync-github.ts    GitHub 仓库与 Release → src/data/github.json
  sync-blog.ts      博客 Feed → src/data/blog.json
  probe-status.ts   白名单探测 → src/data/status.json
  github-cache.json ETag 缓存（由同步脚本维护）
tests/
  unit/             i18n、search、snapshots、status
  e2e/              core.spec.ts
docs/
  maintenance.md    维护与部署手册
  data-sources.md   素材来源与取舍记录
.github/workflows/
  ci.yml            校验、构建、E2E、部署
  sync-content.yml  每天同步快照
  probe-status.yml  每天探测状态
```

## 本地开发

### 环境要求

- Node.js 22 或更新版本（`package.json` 的 `engines` 与 CI 一致）。
- npm（仓库包含 `package-lock.json`，使用 `npm ci` 获得可复现安装）。
- E2E 需要 Chromium；首次运行前安装浏览器。

### 启动

```sh
npm ci
npm run dev
```

- 默认地址：<http://localhost:4321>。
- 开发服务器绑定 `0.0.0.0`，便于局域网或容器访问。
- 生产构建与预览：

```sh
npm run build
npm run preview
```

- 产物输出到 `dist/`；预览同样默认 4321 端口。
- **开发服务器与预览服务器会争用 4321**，不要同时启动；E2E 会自行启动预览（本地已有 4321 时直接复用）。

### 推荐工作流

```sh
npm run check && npm run lint && npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## 脚本

| 命令                   | 作用                                           |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Astro 开发服务器（`0.0.0.0:4321`）             |
| `npm run build`        | 静态构建到 `dist/`                             |
| `npm run preview`      | 预览生产构建（`0.0.0.0:4321`）                 |
| `npm run check`        | `astro check`：类型与模板检查                  |
| `npm run lint`         | ESLint（Astro / Vue / TypeScript / Node 脚本） |
| `npm run format`       | Prettier 写入格式化                            |
| `npm run format:check` | Prettier 只检查，不修改                        |
| `npm test`             | Vitest 单元测试                                |
| `npm run test:e2e`     | Playwright E2E（需先 `build`）                 |
| `npm run sync:github`  | 同步 GitHub 仓库、推送时间与最新 Release       |
| `npm run sync:blog`    | 从博客首页声明的 RSS / Atom 同步文章           |
| `npm run sync`         | 依次执行两个同步                               |
| `npm run status:probe` | 探测白名单服务并更新 7 天观测                  |

## 内容模型

四个集合都使用 `glob` loader 读取 `src/content/<collection>/*.json`，并在 `src/content.config.ts` 中用 Zod 校验；任何字段不合法都会让构建失败。

### 项目（`projects`）

| 字段           | 类型 / 约束                                                         | 说明                            |
| -------------- | ------------------------------------------------------------------- | ------------------------------- |
| `name`         | `string`                                                            | 展示名称                        |
| `series`       | `Nano` \| `Z` \| `Halo` \| `Cloud` \| `Play` \| `Craft`             | 家族                            |
| `category`     | `string`                                                            | 真实分类                        |
| `status`       | `released` \| `active` \| `experimental` \| `archived` \| `planned` | 发布状态                        |
| `tagline`      | `string`                                                            | 一句话简介                      |
| `description`  | `string`                                                            | 较长介绍                        |
| `featured`     | `boolean`，默认 `false`                                             | 是否首页精选                    |
| `displayOrder` | 整数                                                                | 排序权重                        |
| `repository`   | URL                                                                 | GitHub 仓库（也用于快照白名单） |
| `technologies` | `string[]`                                                          | 技术栈                          |
| `features`     | `string[]`                                                          | 功能点                          |
| `architecture` | `string[]`                                                          | 架构说明                        |
| `logo`         | 可选路径                                                            | `/images/projects/...`          |
| `cover`        | 可选路径                                                            | 封面截图                        |
| `accent`       | `#RRGGBB`                                                           | 品牌色                          |
| `websiteUrl`   | 可选 URL                                                            | 官网 / 在线体验                 |
| `downloadUrl`  | 可选 URL                                                            | 仅用于真实存在的下载            |
| `keywords`     | `string[]`，默认空                                                  | 搜索关键字                      |

英文覆盖层必须为每个项目提供 `category`、`tagline`、`description`、`features`、`architecture`；中文覆盖层可只覆盖需要调整的字段，单测会确保每个项目两种语言都存在。

### 实验（`lab`）

`title`、`description`、`type`（`demo` / `experiment` / `visualization` / `prototype`）、`technologies[]`、可选 `demoUrl` / `sourceUrl` / `cover`、`status`（`active` / `experimental` / `archived`）、`displayOrder`。

### 工具（`tools`）

`name`、`description`、`category`、`url`、可选 `sourceUrl` / `projectSlug` / `serviceId`、`displayOrder`。只列真实可用产品，不添加未上线域名。分类与英文简介在 `src/i18n/content.ts` 的 `toolTranslations` 中维护。

### 里程碑（`milestones`）

`title`、ISO 日期 `date`、可选 `description` / `projectSlug` / `sourceUrl`。人工里程碑必须附真实来源，并与 GitHub 自动动态可区分。

### 排序、精选与空状态

- 项目：`featured` 降序 → `displayOrder` 升序。
- 工具：`displayOrder` 升序。
- 动态：按发生时间降序。
- Lab 与 Milestones 目录为空时页面保持空状态；**不要为了填满页面而编造内容**。构建时可能出现“空集合”提示，这是预期行为。

### 素材规则

- 真实 Logo 放 `public/images/projects/`，在 `logo` 中写 `/images/projects/文件名`；封面同理用 `cover`。
- 两个路径都必须在 `docs/data-sources.md` 记录源 URL 与获取日期。
- 没有专属素材就省略字段，使用名称字标或隐藏模块；不使用框架默认图标，也不生成虚构产品界面。
- 版本号与 Release 不写进内容 JSON，只来自快照。

### 新增项目步骤

1. 在 `src/content/projects/` 新建 JSON，字段以上表为准，`repository` 必须是可核实的 GitHub 地址。
2. 确认 `series`、`category`、`status` 与公开资料一致；未发布项目用 `active`，不要创建虚假下载地址或 Release。
3. 决定 `featured` 与 `displayOrder`；若改变精选数量，同步检查首页文案、布局与 E2E 中的数量断言。
4. 如素材齐全，放入 `public/images/projects/` 并更新 `docs/data-sources.md`。
5. 在 `src/i18n/content.ts` 补 `projectTranslations.zh` 与 `.en`，键与文件名一致。
6. 执行 `npm run sync:github`，确认 `src/data/github.json` 中出现对应仓库与 Release。
7. 运行 `npm run check && npm run lint && npm test && npm run build && npm run test:e2e`。
8. 若新增固定页面，还需补中英路由、导航、搜索索引、Sitemap 与 E2E 路由列表。

完整说明见 `docs/maintenance.md`。

## 数据快照与同步

构建只读取快照，不发起外网请求；同步失败保留上一份成功数据，外网故障不应阻断构建。三个快照都带 `schemaVersion: 1`。

### `src/data/github.json` — `npm run sync:github`

- 白名单来自 `src/content/projects/*.json` 的 `repository`：仅接受 `github.com` / `www.github.com` 的标准 `owner/repo` 地址，大小写不敏感去重。
- 每个仓库请求两件事：仓库元数据、`releases?per_page=100`。
- 10 秒超时；支持 `ETag` / `If-None-Match`，304 时复用旧数据；缓存写入 `scripts/github-cache.json`（会随同步工作流一起提交）。
- 只保留公开字段：描述、URL、Stars、Forks、主语言、Topics、最近推送时间、归档状态、最新 Release。
- Release 过滤 draft，选择发布时间最新的非草稿 Release（保留 prerelease 标记）。
- 单个仓库失败时：有旧数据则标记 `syncStatus: 'stale'` 并保留旧值；从未成功则标记 `'unavailable'`，字段为空而不是伪造 0。
- 可选 `GITHUB_TOKEN` 提高限额；CI 使用平台 `github.token`。**不要提交 Token**。

### `src/data/blog.json` — `npm run sync:blog`

- 先抓取 `https://blog.zhoujun.dev`，只识别页面声明的 `application/rss+xml` / `application/atom+xml` 备用链接，逐个尝试。
- 10 秒超时；兼容 RSS 与 Atom。
- 摘要会移除 `<script>` / `<style>` 与所有标签、解码实体、压缩空白，只保留纯文本。
- 失败时保留旧文章与 `lastSuccessfulAt`，不写入错误内容。

### `src/data/status.json` — `npm run status:probe`

- 探测逻辑与阈值见[状态观测](#状态观测)。
- 每次运行只追加一次采样；历史裁剪到 7 天。
- 快照缺失或损坏不会阻止新一轮探测。

### Token 与安全

- 不把 Token 写入源码、快照、前端环境变量或仓库；所有密钥只放 GitHub Secrets。
- 可选本地设置（PowerShell）：`$env:GITHUB_TOKEN="..."`；bash：`export GITHUB_TOKEN=...`。
- 快照是构建输入，修改后需提交才会进入部署。

## 测试与质量

### 命令

```sh
npm run check
npm run lint
npm run format:check
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

### 单元测试（Vitest，30 个）

- `tests/unit/i18n.test.ts`
  - 中英路径生成、去前缀、末尾斜杠规范化、语言切换；
  - `htmlLang` 声明；
  - 遍历 `ui.en` 确保没有空文案；
  - 每个项目与工具都有中英覆盖层；
  - 日期按语言格式化且使用 UTC。
- `tests/unit/search.test.ts`
  - 中文整词 + 二元组、英文 camelCase / 连字符拆分；
  - 按名称、技术栈、中文描述检索；
  - 短词不模糊、复合词不扩散、标题权重高于正文；
  - 空查询与无匹配返回空；
  - 高亮片段切分正确。
- `tests/unit/snapshots.test.ts`
  - GitHub 字段归一化保留 0 值、不泄漏私有字段；
  - 忽略草稿 Release，选择最新非草稿；
  - 失败时保留旧快照或标记不可用；
  - 只发现声明的 Feed 链接；
  - 摘要去标签、去脚本、解码实体；
  - RSS 解析不保留 HTML；
  - 状态探测拒绝白名单外重定向；
  - 慢 / 失败 / 缺失的分类与 7 天裁剪。
- `tests/unit/status.test.ts`
  - 无数据保持 `unknown`；
  - 超过 26 小时的采样视为过期；
  - 未覆盖至少 5 天不显示可用率；
  - 完整窗口按 `operational + degraded` 计算可用率。

### E2E（Playwright，20 个用例 × 2 套配置）

配置：`playwright.config.ts`，30 秒超时、2 个 worker、失败保留 trace 与截图；项目为 Desktop Chrome 与 Pixel 5（mobile-chromium）。`webServer` 运行 `npm run preview -- --port 4321`，本地复用已存在的服务器，CI 中总是新启。

覆盖内容：

- 全部核心路由可渲染，且标题、语言、canonical 与 `hreflang` 正确；
- 语言切换保留路径与查询参数；
- 中英两版都暴露 30 个应用与 8 个精选项目；
- 项目筛选可组合、可重置，英文控件文案正确；
- 首页家族入口预选对应筛选；
- 页头滚动状态、进度条与平台化搜索快捷键；
- 动态不重复摘要、保留每条代码更新；
- 命令面板可键盘检索、Escape 关闭；
- `/search?q=` 可分享；
- 博客外链不复制文章；
- 主题刷新后持久化；
- 移动端菜单可通过背景、按钮、Escape 关闭并正确导航；
- 320px 下紧凑控件仍可用；
- 主要页面在多种宽度下无横向溢出；
- 禁用 JavaScript 时正文仍可读；
- reduced motion 下内容完整；
- 状态页不伪造运行时间 / 可用率；
- 浅色 / 深色、中文 / 英文下通过 axe 基础无障碍检查。

### 手动验收清单

修改 UI 后至少检查 320、375、768、1440px，并分别验证：

- 中文根路径与 `/en/`，浅色与深色；
- 语言切换后的路径、查询参数与锚点；
- 键盘 Tab 顺序、焦点可见、Escape 关闭菜单；
- 无横向溢出；
- 禁用 JS 后内容可读；
- 浏览器控制台无水合错误与资源 404。

真机 Safari / Android、线上 Lighthouse、HTTPS 与 DNS 必须在部署环境验证，本地结果不能当作线上结果。

## CI / CD

三个工作流位于 `.github/workflows/`：

| 工作流             | 触发                           | 作用                                                 |
| ------------------ | ------------------------------ | ---------------------------------------------------- |
| `ci.yml`           | PR、推送到 `main`、手动触发    | 校验 + 构建 + E2E；主分支通过后部署 Cloudflare Pages |
| `sync-content.yml` | 每天（`43 1 * * *`）、手动触发 | 同步 GitHub / 博客快照并提交                         |
| `probe-status.yml` | 每天（`17 1 * * *`）、手动触发 | 探测白名单服务并提交 `src/data/status.json`          |

### `ci.yml` 流程

1. **verify**（`ubuntu-latest`，20 分钟超时）：
   - `actions/checkout@v4`；
   - `actions/setup-node@v4`，Node 22，npm 缓存；
   - `npm ci`；
   - `npm run check` → `npm run lint` → `npm test` → `npm run build`；
   - 按 `package-lock.json` 哈希缓存 `~/.cache/ms-playwright`，安装 Chromium（`--with-deps`）；
   - `npm run test:e2e`；
   - 失败时上传 `test-results`（截图 / trace / 报告，保留 7 天）；
   - 主分支上传 `dist`（保留 1 天），供部署任务下载。
2. **deploy**：
   - 依赖 `verify` 成功；
   - 仅在 `push` 或 `workflow_dispatch` 且分支为 `refs/heads/main` 时运行；
   - `environment: production`，URL 为 <https://zhoujun.dev>；
   - 下载同一次构建的 `dist`，不重复构建；
   - `cloudflare/wrangler-action@v3` 执行 `pages deploy dist --project-name=... --branch=main`。
3. PR 只测试不部署；`concurrency: ci-${{ github.ref }}` 会取消同一分支的旧运行。

### 首次部署配置

1. Cloudflare 创建 Pages 项目（**Direct Upload**，生产分支 `main`），默认名 `z-os`；如需改名，设置仓库变量 `CLOUDFLARE_PAGES_PROJECT`。
2. 创建仅含 **Pages:Edit** 权限的 API Token。
3. 在仓库 Secrets 配置：
   - `CLOUDFLARE_API_TOKEN`（必需，权限 Pages:Edit）
   - `CLOUDFLARE_ACCOUNT_ID`（可选；未设置时回退到与 `halo_music` 相同的账户 ID）
4. 在 Pages 中绑定 `zhoujun.dev`，配置 DNS 与 HTTPS。
5. 启用仓库 Actions；如启用自动同步，确认默认分支与 `contents: write` 权限符合仓库策略。
6. 首次上线后检查：Canonical、Sitemap、OG 图、Manifest、`_headers`、全部项目详情、博客与 GitHub 外链。

### 回滚

Cloudflare Pages 仪表盘的 Deployments 列表保留历史部署，可直接选择上一个成功版本回滚；也可用本地 `dist` 或重新运行 `ci.yml` 手动部署。

### 部署频率与配额

- `sync-content.yml` 与 `probe-status.yml` 各每天运行一次；快照有变化时会各提交一次，每次主分支提交都会触发 `ci.yml` 的部署，因此单日自动部署通常不超过 2 次。
- Cloudflare Pages 免费版部署配额有限；长期自动化前核对额度，或进一步降低同步频率 / 让快照提交不触发部署。
- 快照没有变化时工作流不提交，因此实际次数取决于同步结果是否改变。

## 设计系统

- **视觉语言**：纸张底色、墨色文本、朱红强调，配以编辑式留白与细分隔线，避免通用 SaaS 模板感。
- **字体**：
  - Inter Variable：拉丁正文与标题；
  - Instrument Serif（400 italic）：拉丁强调与编辑式标签；
  - JetBrains Mono Variable：数据、标签与代码感信息；
  - 中文：`PingFang SC` / `Hiragino Sans GB` / `MiSans` / HarmonyOS Sans / 思源黑体 / 微软雅黑等系统链；强调用思源宋体 / 宋体系统链；
  - 全部通过 `@fontsource` 自托管，不依赖外部 CDN。
- **主题**：深色默认，浅色由本地偏好恢复；两套主题共用 `src/styles/global.css` 的 CSS 变量，不在组件中复制色板。
- **节奏**：统一的 `section` / `section-compact` / `page-hero` 间距控制纵向节奏，移动端有单独收紧规则。
- **动效**：滚动进度与渐显均服务内容，且服从 `prefers-reduced-motion`。
- **中文排版**：`:lang(zh)` 下强制直立，避免浏览器合成斜体；数字与拉丁标签仍用等宽或衬线字体。

## 故障排查

| 现象                                      | 原因 / 处理                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `npm run dev` 与 `preview` 同时报端口占用 | 两者默认都用 4321；先停一个，或给其中一个加 `--port`                   |
| `test:e2e` 打开空白页或旧内容             | 先 `npm run build`；Playwright 预览的是 `dist/`，不会自动构建          |
| Playwright 报缺少浏览器                   | 执行 `npx playwright install chromium`（CI 会带 `--with-deps`）        |
| `sync:github` 返回 403 / 限流             | 设置 `GITHUB_TOKEN` 后重试；未设置时匿名限额较低                       |
| 构建提示 Lab / Milestones 为空            | 预期行为；空集合表示尚无确认内容，不应填充                             |
| 页面缺少某个 Release                      | 检查 `src/data/github.json`，再运行 `npm run sync:github`；草稿不展示  |
| 状态页显示“数据收集中”                    | 历史跨度不足 5 天或样本太少；这是设计行为，不代表故障                  |
| 部署 403 / project not found              | 核对 `CLOUDFLARE_API_TOKEN` 权限、`CLOUDFLARE_ACCOUNT_ID` 与项目名变量 |
| 部署成功后域名仍旧版                      | 检查 Pages 自定义域绑定、DNS 与缓存；确认部署分支为 `main`             |
| CI 中 E2E 偶发超时                        | 本地复跑并查看 `playwright-artifacts`；检查外部链接与网络状况          |

## 文档

- `docs/maintenance.md`：新增项目 / 实验 / 工具 / 里程碑、双语路由、搜索索引、快照维护、UI 验收、Cloudflare 部署清单。
- `docs/data-sources.md`：素材来源、Logo / 截图获取日期、未使用素材的原因。

## 数据诚信与限制

- 所有项目、版本、Release 与服务状态都来自可核实的公开来源；不创建虚假下载地址或 Release。
- 状态页是低频观测日志，不是 SLA，不承诺完整可用率；快照缺失时保持未知。
- 博客只做入口与快照摘要，文章正文以博客站为准。
- 本地构建、Lighthouse 与 Playwright 结果不代表线上表现；生产环境需单独验证。
- 仓库是个人站点项目，不提供多用户、评论或后台管理功能。
