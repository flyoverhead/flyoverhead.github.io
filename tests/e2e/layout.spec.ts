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
    expect(urls).toEqual(['/']);
    for (const url of urls) {
      await page.goto(url);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width, url).toBeLessThanOrEqual(360);
    }
  });
});

test('footer has contact links', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer).toContainText('Get in touch');
  await expect(footer.getByRole('link')).toHaveText(['LinkedIn', 'GitHub']);
  await expect(footer).not.toContainText('@');
});

test('in-page anchors land below the sticky header', async ({ page }) => {
  await page.goto('/#stack');
  const headerBottom = await page.locator('header.top').evaluate((e) => e.getBoundingClientRect().bottom);
  const headingTop = await page.locator('#stack h2').evaluate((e) => e.getBoundingClientRect().top);
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

test('title bar has no traffic lights or menus', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('header.top');
  await expect(bar.locator('.lights')).toHaveCount(0);
  await expect(bar.locator('nav, details, a')).toHaveCount(0);
  await expect(bar.getByRole('button', { name: /theme/i })).toBeVisible();
});

test.describe('sidebar', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('shows coloured section tags on desktop', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('aside.sidebar a');
    await expect(items).toHaveText(['About', 'Selected work', 'AI & Claude', 'Open source', 'Stack']);
    await expect(items.first()).toHaveAttribute('aria-current', 'page');
    const dot = await items.nth(1).locator('.tag').evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(dot).not.toBe('rgba(0, 0, 0, 0)');
  });

});

test.describe('sidebar on phones', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('is hidden below 900px', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside.sidebar')).toBeHidden();
  });
});
