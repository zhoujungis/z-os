# 维护与部署

当前内容范围：30 个应用，分为 Nano、Z、Halo、Cloud、Play、Craft 六个家族；其中 17 个已发布、13 个开发中，8 个在首页精选。

## 新增项目

1. 在 `src/content/projects/` 新建 JSON，参考现有项目填写名称、家族（`series`）、真实分类、状态、简介、仓库、技术栈、功能、架构和品牌色。
2. 内容必须来自可核实的公开资料，并同步更新 `docs/data-sources.md` 中的 README 链接。未发布项目使用 `active`，不要创建虚假下载地址或 Release。
3. `featured: true` 仅用于首页精选，当前为 8 个；`displayOrder` 控制项目排序。调整精选数量时同步检查首页文案和布局。
4. 真实 Logo 放入 `public/images/projects/`，在 `logo` 中填写 `/images/projects/文件名`。封面截图放入同一目录，在 `cover` 中引用。两者都必须在 `docs/data-sources.md` 记录源 URL 和获取日期。没有专属 Logo 就省略 `logo`，不要使用框架默认图标或生成虚构产品界面。
5. 在 `src/i18n/content.ts` 的 `projectTranslations.zh` 与 `.en` 中为该项目补充分类、简介、功能与架构覆盖层，键与内容文件名一致。
6. 执行 `npm run sync:github`，检查 `src/data/github.json` 的仓库与 Release 数据。
7. 执行 `npm run check && npm run lint && npm test && npm run build && npm run test:e2e`。

## 新增实验、工具或里程碑

在相应内容目录新增 JSON，字段以 `src/content.config.ts` 的实际 Zod schema 为准。Lab 没有确认内容时保持空状态。Tools 只列出真实可用产品，不添加未上线域名。Timeline 的人工里程碑必须可与公开动态区分，并附真实来源。工具同样需要在 `src/i18n/content.ts` 中补齐两种语言的分类或简介。

## 双语与路由

中文页面位于根路径，英文页面位于 `/en/`。页面实现只写一份，放在 `src/views/`；`src/pages/` 与 `src/pages/en/` 的路由包装分别传入 `lang="zh"` 或 `lang="en"`。界面文案添加到 `src/i18n/ui.ts` 的 `zh` 后，必须同步补 `en`。新增固定页面时，需要同时创建中英路由、补充导航、`src/utils/search-index.ts`、sitemap 与 E2E 路由列表。

语言切换由 `LanguageSwitch.astro` 生成目标路径，`BaseLayout.astro` 的内联脚本保留查询参数与锚点。新增绕过 `BaseLayout` 的页面会丢失语言切换与主题能力，应避免。

## 搜索与导航

项目、Lab、Tools、文章、页面和动态在 `src/pages/search-index.json.ts` 与 `src/pages/en/search-index.json.ts` 构建时生成对应语言的索引；Command Palette 在首次打开时加载当前语言索引。项目筛选支持 `q`、`family`、`category`、`status` 和 `tech` URL 参数，筛选值保持语言无关，展示文案随界面语言变化。

## 快照维护

- `npm run sync:github`：GitHub 仓库、更新时间和 Release。
- `npm run sync:blog`：博客首页声明的 Feed。
- `npm run status:probe`：固定白名单服务探测。
- 状态是低频观测记录，不是 SLA；页面必须保留“数据收集中”与“低频观测，不是 SLA”的诚实表述。
- 单次失败保留已有 GitHub/Blog 快照；外网故障不应阻断构建。
- 不把 Token 写入源码、快照、前端环境变量或仓库。GitHub Actions 使用平台提供的 `github.token`。
- 上线前检查定时 Actions 的调度、权限、分支与快照提交是否正常运行；当前配置文件本身不代表监控已启用。

## UI 约定

深色为默认主题，浅色主题由用户本地保存。双主题共用 `src/styles/global.css` 的 Token，不在组件中复制一套新颜色。字体通过 `@fontsource-variable` 本地自托管。交互动画服从 `prefers-reduced-motion`。首页内容无需 JavaScript 即可阅读，搜索、筛选和菜单由 Vue 岛屿增强。

修改 UI 后至少检查 320、375、768、1440px，并分别验证中文根路径与 `/en/` 的浅色/深色、语言切换后路径与查询参数、键盘、无横向溢出、无 JS 内容和 axe。真实浏览器控制台不应出现水合错误或资源 404。

## Cloudflare Pages

部署由 `.github/workflows/ci.yml` 完成，PR 只测试，主分支通过后直传 `dist`：

1. 在 Cloudflare 创建 Pages 项目（Direct Upload，生产分支 `main`），项目名默认为 `z-os`；如需改名，设置仓库变量 `CLOUDFLARE_PAGES_PROJECT`。
2. 创建仅含 Pages:Edit 权限的 API Token，在仓库 Secrets 配置 `CLOUDFLARE_API_TOKEN`；`CLOUDFLARE_ACCOUNT_ID` 可选，未设置时回退到与 `halo_music` 相同的账户 ID。
3. CI 依次执行 `check`、`lint`、单元测试、构建与 Playwright E2E；全部通过后才执行 `wrangler pages deploy dist --branch=main`，生产部署使用同一次构建结果。
4. 在 Pages 项目中绑定 `zhoujun.dev` 并配置 DNS/HTTPS；这些是平台操作，本地构建不会自动完成。
5. 检查 Canonical、Sitemap、OG 图、Manifest、`_headers`、全部项目详情、博客与 GitHub 外链。
6. 如需 GitHub Actions 自动同步，启用仓库 Actions，并确认默认分支及 `contents: write` 权限符合仓库策略。
7. 定时快照提交同样会触发主分支部署：`sync-content.yml` 与 `probe-status.yml` 各每天运行一次，单日自动部署通常不超过 2 次；Pages 免费版部署配额有限，长期运行前确认额度或进一步调整节奏。
8. 正式上线后再做生产 Lighthouse、真实设备与持续服务观测，不把本地结果当作线上结果。
