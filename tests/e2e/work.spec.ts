import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { parse } from 'yaml';

const NOTE = 'Internal details are anonymised under NDA. Diagrams are redrawn and the numbers rounded.';
const cases = readdirSync('src/content/work').map((f) => {
  const fm = readFileSync(`src/content/work/${f}`, 'utf8').match(/^---\n([\s\S]*?)\n---/)!;
  return { id: f.replace(/\.md$/, ''), ...parse(fm[1]) } as { id: string; title: string; diagram: string[]; order: number };
});

for (const c of cases) {
  test(`case page ${c.id}`, async ({ page }) => {
    await page.goto(`/work/${c.id}/`);
    await expect(page.locator('h1')).toHaveText(c.title);
    await expect(page.locator('.nda-note')).toHaveText(NOTE);
    await expect(page.getByRole('heading', { name: /problem$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /what I did$/ })).toBeVisible();
    await expect(page.locator('.diagram .node')).toHaveCount(c.diagram.length);
  });
}

test('next links cycle through all six cases', async ({ page }) => {
  const start = cases.find((c) => c.order === 1)!;
  await page.goto(`/work/${start.id}/`);
  const seen: string[] = [];
  for (let i = 0; i < 6; i++) {
    seen.push(new URL(page.url()).pathname);
    await page.locator('a.next').click();
  }
  expect(new URL(page.url()).pathname).toBe(`/work/${start.id}/`);
  expect(new Set(seen).size).toBe(6);
});

test('home lists six cards linking to case pages', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#work .card h3 a');
  await expect(links).toHaveCount(6);
  await expect(links.first()).toHaveAttribute('href', '/work/iac-platform/');
});
