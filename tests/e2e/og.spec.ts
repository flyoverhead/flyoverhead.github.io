import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('og.png is 1200x630', () => {
  const png = readFileSync('dist/og.png');
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBe(630);
});

test('og page is not indexed', async ({ page }) => {
  await page.goto('/og/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('no CV or case pages are built', () => {
  for (const p of ['dist/cv.pdf', 'dist/cv/index.html', 'dist/work']) expect(existsSync(p), p).toBe(false);
});
