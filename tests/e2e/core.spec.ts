import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import blogData from '../../src/data/blog.json' with { type: 'json' };

const zhRoutes = [
  '/',
  '/projects',
  '/lab',
  '/tools',
  '/activity',
  '/timeline',
  '/about',
  '/search',
  '/status',
  '/404',
];
const enRoutes = zhRoutes.map((route) => (route === '/' ? '/en' : `/en${route}`));
const routes = [...zhRoutes, ...enRoutes];

const basePath = (route: string) =>
  route === '/en' ? '/' : route.startsWith('/en/') ? route.slice(3) : route;
const isEnglish = (route: string) => route === '/en' || route.startsWith('/en/');

test('all core routes render a unique page with correct locale metadata', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const english = isEnglish(route);
    const base = basePath(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveTitle(/ZHOUJUN\.DEV/);
    await expect(page.locator('html')).toHaveAttribute('lang', english ? 'en' : 'zh-CN');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://zhoujun.dev${route === '/' ? '/' : route}`,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute(
      'href',
      `https://zhoujun.dev${base === '/' ? '/' : base}`,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      'href',
      `https://zhoujun.dev${base === '/' ? '/en' : `/en${base}`}`,
    );
  }
});

test('language switch preserves the current path and query', async ({ page }) => {
  await page.goto('/projects?family=Nano');
  const toEnglish = page.locator('[data-language-switch]');
  await expect(toEnglish).toHaveAttribute('href', '/en/projects?family=Nano');
  await toEnglish.click();
  await expect(page).toHaveURL(/\/en\/projects\?family=Nano/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.filter-count strong')).toHaveText('8');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(8);

  const toChinese = page.locator('[data-language-switch]');
  await expect(toChinese).toHaveAttribute('href', '/projects?family=Nano');
  await toChinese.click();
  await expect(page).toHaveURL(/\/projects\?family=Nano$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('.filter-count strong')).toHaveText('8');
});

test('both locales expose thirty applications and eight featured projects', async ({ page }) => {
  for (const home of ['/', '/en']) {
    await page.goto(home);
    await expect(page.locator('[data-project-card]')).toHaveCount(8);
    for (const name of [
      'NanoBrowser',
      'z-desktop',
      'HALO Music',
      'Fortune',
      'Routewise',
      'Happy Games',
      'Block World 3D',
      'z-memory',
    ]) {
      await expect(page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    }
  }
  for (const index of ['/projects', '/en/projects']) {
    await page.goto(index);
    await expect(page.locator('[data-project-card]')).toHaveCount(30);
    for (const name of [
      'NanoBrowser',
      'NanoQA',
      'NanoSSH',
      'z-bot',
      'z-desktop',
      'z-memory',
      'HALO Music',
      'Echo Space',
      'InterviewAtlas',
      'Kaoyan Workbench',
      'Happy Games Skill',
      'BigBoom',
    ]) {
      await expect(page.getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
    }
  }
});

test('project filters combine and reset correctly in Chinese', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('.filter-count strong')).toHaveText('30');
  await page.getByLabel('搜索项目', { exact: true }).fill('NanoBrowser');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: '重置' }).click();
  await page.getByRole('combobox', { name: '状态', exact: true }).selectOption('active');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(13);
  await expect(page.locator('[data-project-card]:visible', { hasText: 'NanoQA' })).toBeVisible();
  await expect(page.locator('[data-project-card]:visible', { hasText: 'NanoSSH' })).toBeVisible();
  await page.getByRole('button', { name: '重置' }).click();
  await page.getByRole('button', { name: /^Nano/ }).click();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(8);
  await expect(page.locator('.filter-count strong')).toHaveText('8');
  await page.getByRole('button', { name: '重置' }).click();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(30);
  await page.getByLabel('搜索项目', { exact: true }).fill('no-such-application');
  await expect(page.locator('#project-empty')).toBeVisible();
  await page.locator('#project-empty').getByRole('button', { name: '重置' }).click();
  await expect(page.locator('#project-empty')).toBeHidden();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(30);
  await expect(page.getByLabel('搜索项目', { exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: '重置' })).toBeDisabled();
});

test('header reports scroll state, progress and platform search shortcut', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const header = page.locator('[data-site-header]');
  const shortcut = page.locator('[data-search-shortcut]');
  await expect(shortcut).toHaveText(/^(⌘ K|Ctrl K)$/);
  if (!testInfo.project.use.isMobile) {
    await expect(shortcut).toBeVisible();
  }
  await expect(page.getByRole('button', { name: '搜索站点' })).toHaveAttribute(
    'aria-keyshortcuts',
    'Meta+K Control+K',
  );
  await expect(header).not.toHaveClass(/is-scrolled/);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() => {
    const value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--scroll-progress'),
    );
    return value > 0.9;
  });
  await expect(header).toHaveClass(/is-scrolled/);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveClass(/is-scrolled/);
});

test('skip link moves keyboard focus into the main content', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.getByRole('link', { name: '跳至主要内容' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('scrolling past a section still reveals its content', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-reveal]')].every((item) =>
      item.classList.contains('is-visible'),
    ),
  );
});

test('project filters expose localized English controls', async ({ page }) => {
  await page.goto('/en/projects');
  await expect(page.getByLabel('Search projects', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Status', exact: true }).selectOption('active');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(13);
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(30);
});

test('family links preselect the matching filter', async ({ page }) => {
  for (const route of ['/projects?family=Nano', '/en/projects?family=Nano']) {
    await page.goto(route);
    await expect(page.locator('.filter-count strong')).toHaveText('8');
    await expect(page.locator('[data-project-card]:visible')).toHaveCount(8);
    await expect(page.getByRole('button', { name: /^Nano/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  }
});

test('activity keeps every code update without repeated summaries', async ({ page }) => {
  for (const route of ['/activity', '/en/activity']) {
    await page.goto(route);
    const items = page.locator('.activity-item');
    const updates = page.locator('.activity-repository_update');
    const releases = page.locator('.activity-release');
    const milestones = page.locator('.activity-milestone');
    expect(await updates.count()).toBeGreaterThan(0);
    expect(await releases.count()).toBeGreaterThan(0);
    await expect(updates.locator('p')).toHaveCount(0);
    await expect(releases.locator('p')).toHaveCount(0);
    expect(await items.count()).toBe(
      (await updates.count()) + (await releases.count()) + (await milestones.count()),
    );
  }
});

test('command palette supports keyboard search and escape in both locales', async ({ page }) => {
  const cases = [
    {
      route: '/',
      trigger: '搜索站点',
      dialog: '站点搜索',
      input: '搜索项目、页面与动态',
    },
    {
      route: '/en',
      trigger: 'Search site',
      dialog: 'Site search',
      input: 'Search projects, pages and activity',
    },
  ];
  for (const item of cases) {
    await page.goto(item.route);
    const trigger = page.getByRole('button', { name: item.trigger });
    await trigger.focus();
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: item.dialog });
    await expect(dialog).toBeVisible();
    await page.getByRole('combobox', { name: item.input }).fill('NanoBrowser');
    await expect(page.getByRole('option').filter({ hasText: 'NanoBrowser' }).first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

test('search page accepts a shared query in both locales', async ({ page }) => {
  for (const route of ['/search?q=Rust', '/en/search?q=Rust']) {
    await page.goto(route);
    await expect(page.locator('.search-results li').first()).toBeVisible();
    await expect(page.locator('.search-results')).toContainText('NanoBrowser');
    await expect(page).toHaveURL(/q=Rust/);
  }
});

test('main site links to the blog without republishing its articles', async ({ page, request }) => {
  for (const route of ['/', '/en', '/activity', '/en/activity', '/timeline', '/en/timeline']) {
    await page.goto(route);
    const content = await page.locator('main').innerText();
    for (const post of blogData.posts) {
      expect(content).not.toContain(post.title);
      expect(content).not.toContain(post.description);
    }
  }

  await page.goto('/');
  await expect(page.getByRole('link', { name: '去博客看看' })).toHaveAttribute(
    'href',
    'https://blog.zhoujun.dev',
  );

  for (const indexUrl of ['/search-index.json', '/en/search-index.json']) {
    const response = await request.get(indexUrl);
    expect(response.ok()).toBe(true);
    const index = await response.text();
    for (const post of blogData.posts) {
      expect(index).not.toContain(post.title);
      expect(index).not.toContain(post.description);
    }
  }
});

test('theme persists across reloads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: '切换到暗色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.evaluate(() =>
    window.dispatchEvent(new StorageEvent('storage', { key: 'z-os-theme', newValue: 'light' })),
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: '切换到暗色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '切换到亮色主题' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('mobile navigation opens, closes and navigates in both locales', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const zhTrigger = page.getByRole('button', { name: '打开导航' });
  await expect(zhTrigger).toHaveAttribute('aria-expanded', 'false');
  await zhTrigger.click();
  await expect(zhTrigger).toHaveAttribute('aria-expanded', 'true');
  const zhDialog = page.getByRole('dialog', { name: '站点导航' });
  await expect(zhDialog).toBeVisible();
  await zhDialog.getByRole('link', { name: /项目/ }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(zhDialog).not.toBeVisible();
  await expect(zhTrigger).toHaveAttribute('aria-expanded', 'false');

  await page.goto('/en');
  const enTrigger = page.getByRole('button', { name: 'Open navigation' });
  await enTrigger.click();
  await expect(enTrigger).toHaveAttribute('aria-expanded', 'true');
  const enDialog = page.getByRole('dialog', { name: 'Site navigation' });
  await expect(enDialog).toBeVisible();
  await enDialog.getByRole('link', { name: /Projects/ }).click();
  await expect(page).toHaveURL(/\/en\/projects$/);
  await expect(enDialog).not.toBeVisible();
  await expect(enTrigger).toHaveAttribute('aria-expanded', 'false');
});

test('mobile navigation closes by backdrop, button and Escape', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.use.isMobile,
    'Backdrop interaction requires a mobile layout viewport',
  );
  await page.goto('/');
  const trigger = page.getByRole('button', { name: '打开导航' });
  const dialog = page.getByRole('dialog', { name: '站点导航' });
  await trigger.click();
  await dialog.click({ position: { x: 20, y: 350 } });
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: '关闭导航' }).click();
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('compact mobile controls remain visible and usable at 320px', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, 'Compact controls require a mobile browser context');
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '搜索站点' })).toBeVisible();
  await expect(page.getByRole('button', { name: '打开导航' })).toBeVisible();
  await expect(page.getByRole('link', { name: '切换到英文' })).toBeVisible();
  for (const control of [
    page.getByRole('button', { name: '搜索站点' }),
    page.getByRole('link', { name: '切换到英文' }),
    page.getByRole('button', { name: '切换到亮色主题' }),
    page.getByRole('button', { name: '打开导航' }),
  ]) {
    const box = await control.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  const familyCells = page.locator('.family-strip a');
  await expect(familyCells).toHaveCount(6);
  for (const cell of await familyCells.all()) {
    await expect(cell).toBeVisible();
  }
  await page.goto('/projects');
  await expect(page.locator('.filter-count strong')).toHaveText('30');
  await page.getByRole('combobox', { name: '状态', exact: true }).selectOption('active');
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(13);
  await page.getByRole('button', { name: '重置' }).click();
  await expect(page.locator('[data-project-card]:visible')).toHaveCount(30);
});

test('primary pages do not overflow at responsive widths', async ({ page }) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/en', '/projects', '/en/projects', '/about', '/en/about']) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('main content is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('写软件');
  await page.goto('http://127.0.0.1:4321/en');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('I write software');
  await page.goto('http://127.0.0.1:4321/projects');
  await expect(page.locator('[data-project-card]')).toHaveCount(30);
  await page.goto('http://127.0.0.1:4321/en/projects');
  await expect(page.locator('[data-project-card]')).toHaveCount(30);
  await context.close();
});

test('reduced motion keeps the product summary and readable content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.hero-stats dd').first()).toHaveText('30');
  await expect(page.locator('.family-strip a')).toHaveCount(6);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('status page does not invent uptime', async ({ page }) => {
  await page.goto('/status');
  await expect(page.locator('main')).toContainText('低频观测，不是 SLA');
  await expect(page.locator('main')).toContainText('数据收集中');

  await page.goto('/en/status');
  await expect(page.locator('main')).toContainText('Low-frequency observation, not an SLA');
  await expect(page.locator('main')).toContainText('Collecting data');

  for (const route of ['/status', '/en/status']) {
    await page.goto(route);
    const cards = page.locator('.status-card');
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      await expect(card.locator('.history-slot')).toHaveCount(7);
    }
    const indexCounts = await page
      .locator('.status-index strong')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.textContent)));
    expect(indexCounts).toHaveLength(5);
    expect(indexCounts.slice(1).reduce((sum, value) => sum + value, 0)).toBe(indexCounts[0]);
    await expect(cards.first().locator('.history-legend')).toContainText(
      route.startsWith('/en') ? 'No sample' : '未采样',
    );
  }
});

test('core pages pass automated accessibility checks in both themes and locales', async ({
  page,
}) => {
  test.setTimeout(240_000);
  for (const route of routes) {
    await page.goto(route);
    const english = isEnglish(route);
    for (const theme of ['dark', 'light']) {
      if ((await page.locator('html').getAttribute('data-theme')) !== theme) {
        const name = english
          ? `Switch to ${theme} theme`
          : theme === 'light'
            ? '切换到亮色主题'
            : '切换到暗色主题';
        await page.getByRole('button', { name }).click();
        await page.waitForTimeout(400);
      }
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  }
});
