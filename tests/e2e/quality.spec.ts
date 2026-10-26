import { globSync, readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { BUILTIN_PATTERNS, loadDenylist, scanForbidden } from '../../src/lib/nda';

const sitemapPaths = () => {
  const xml = readFileSync('dist/sitemap-0.xml', 'utf8');
  return [...xml.matchAll(/<loc>https:\/\/flyoverhead\.github\.io([^<]*)<\/loc>/g)].map((m) => m[1]);
};

test('sitemap lists only home, not og', () => {
  expect(sitemapPaths()).toEqual(['/']);
});

test('robots.txt points at the sitemap', () => {
  expect(readFileSync('dist/robots.txt', 'utf8')).toContain('Sitemap: https://flyoverhead.github.io/sitemap-index.xml');
});

test('dist NDA scan clean', () => {
  const files = globSync('dist/**/*.{html,xml,txt,json}');
  expect(files.length).toBeGreaterThan(2);
  expect(scanForbidden(files, [...BUILTIN_PATTERNS, ...loadDenylist()])).toEqual([]);
});

test('meta on every page', async ({ page }) => {
  for (const path of sitemapPaths()) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', `https://flyoverhead.github.io${path}`);
    const desc = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(desc.length, path).toBeGreaterThanOrEqual(50);
    expect(desc.length, path).toBeLessThanOrEqual(160);
    await expect(page.locator('meta[property="og:image"]'), path).toHaveAttribute('content', 'https://flyoverhead.github.io/og.png');
    await expect(page.locator('meta[name="twitter:card"]'), path).toHaveAttribute('content', 'summary_large_image');
  }
});

test('unknown path renders the 404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('404');
  await expect(page.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
});

for (const scheme of ['dark', 'light'] as const) {
  test.describe(`axe ${scheme}`, () => {
    test.use({ colorScheme: scheme });
    test(`axe: no violations (${scheme})`, async ({ page }) => {
      for (const path of ['/', '/no-such-page/']) {
        await page.goto(path);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations.map((v) => `${path}: ${v.id} (${v.nodes.length})`)).toEqual([]);
      }
    });
  });
}
