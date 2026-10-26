import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const DARK_BG = 'rgb(21, 18, 31)';
const LIGHT_BG = 'rgb(246, 243, 255)';
const bodyBg = (page: import('@playwright/test').Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe('theme', () => {
  test.use({ colorScheme: 'dark' });

  test('follows system dark', async ({ page }) => {
    await page.goto('/');
    expect(await bodyBg(page)).toBe(DARK_BG);
  });

  test('toggle persists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /theme/i }).click();
    expect(await bodyBg(page)).toBe(LIGHT_BG);
    await page.reload();
    expect(await bodyBg(page)).toBe(LIGHT_BG);
  });

  test('garbage stored value ignored', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'purple'));
    await page.goto('/');
    expect(await bodyBg(page)).toBe(DARK_BG);
  });
});

test.describe('system light', () => {
  test.use({ colorScheme: 'light' });

  test('follows system light', async ({ page }) => {
    await page.goto('/');
    expect(await bodyBg(page)).toBe(LIGHT_BG);
  });

  test('stored dark wins over system light', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    expect(await bodyBg(page)).toBe(DARK_BG);
  });
});

test.describe('narrow screens', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('no horizontal scroll on every page at 360px', async ({ page }) => {
    const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
    const urls = [...xml.matchAll(/<loc>https:\/\/flyoverhead\.github\.io([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(7);
    for (const url of urls) {
      await page.goto(url);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, url).toBeLessThanOrEqual(360);
    }
  });
});

test.describe('no javascript', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test('mobile menu opens without JS', async ({ page }) => {
    await page.goto('/');
    const menu = page.locator('header.top details');
    await menu.locator('summary').click();
    await expect(menu.getByRole('link', { name: /experience/i })).toBeVisible();
  });
});

test('footer has contact links', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toContainText('Get in touch');
  await expect(footer.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:a.b.letunov@gmail.com');
});

test('in-page anchors land below the sticky header', async ({ page }) => {
  await page.goto('/#experience');
  const headerBottom = await page.locator('header.top').evaluate((e) => e.getBoundingClientRect().bottom);
  const headingTop = await page.locator('#experience h2').evaluate((e) => e.getBoundingClientRect().top);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
});

test('skip link is visible when focused', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(40);
  expect(box?.height ?? 0).toBeGreaterThan(10);
});

test('window title bar has traffic lights and a segmented control', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('header.top');
  await expect(bar.locator('.lights i')).toHaveCount(3);
  const seg = bar.locator('.segmented a');
  await expect(seg).toHaveText(['Overview', 'Work', 'CV']);
  await expect(seg.nth(0)).toHaveAttribute('href', '/');
  await expect(seg.nth(1)).toHaveAttribute('href', '/#work');
  await expect(seg.nth(2)).toHaveAttribute('href', '/cv/');
});

test.describe('sidebar', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows coloured section tags on desktop', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('aside.sidebar a');
    await expect(items).toHaveText(['About', 'Selected work', 'AI & Claude', 'Open source', 'Experience', 'CV']);
    await expect(items.first()).toHaveAttribute('aria-current', 'page');
    const dot = await items.nth(1).locator('.tag').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(dot).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('case pages highlight Selected work', async ({ page }) => {
    await page.goto('/work/iac-platform/');
    await expect(page.locator('aside.sidebar a[aria-current="page"]')).toHaveText('Selected work');
  });
});

test.describe('sidebar on phones', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('is hidden below 900px', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside.sidebar')).toBeHidden();
  });
});

test('segmented control marks the current page', async ({ page }) => {
  for (const [url, label] of [['/', 'Overview'], ['/work/iac-platform/', 'Work'], ['/cv/', 'CV']]) {
    await page.goto(url);
    await expect(page.locator('header.top .segmented a[aria-current="page"]'), url).toHaveText(label);
  }
});
