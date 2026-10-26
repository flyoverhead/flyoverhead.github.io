import { existsSync, readFileSync, statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { BUILTIN_PATTERNS } from '../../src/lib/nda';

test('cv.pdf exists and is valid', () => {
  expect(existsSync('dist/cv.pdf')).toBe(true);
  expect(statSync('dist/cv.pdf').size).toBeGreaterThan(20_000);
  expect(readFileSync('dist/cv.pdf').subarray(0, 4).toString()).toBe('%PDF');
});

test('og.png is 1200x630', () => {
  const png = readFileSync('dist/og.png');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test.describe('print', () => {
  test.use({ colorScheme: 'dark' });

  test('cv has no phone and no dark background', async ({ page }) => {
    await page.goto('/cv/');
    await page.emulateMedia({ media: 'print' });
    const text = await page.locator('body').innerText();
    expect(text).toContain('a.b.letunov@gmail.com');
    for (const p of BUILTIN_PATTERNS) expect(text).not.toMatch(p);
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect(page.locator('header.top')).toBeHidden();
  });
});

test('cv lists all infrastructure roles with highlights', async ({ page }) => {
  await page.goto('/cv/');
  await expect(page.locator('.cv-role')).toHaveCount(4);
  await expect(page.locator('.cv-role').first().locator('li').first()).toBeVisible();
  await expect(page.locator('main')).toContainText('Claude Code in Action');
});

test('og page is not indexed', async ({ page }) => {
  await page.goto('/og/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});
