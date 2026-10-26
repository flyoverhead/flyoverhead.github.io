import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const snapshot = JSON.parse(readFileSync('src/data/repos.snapshot.json', 'utf8')) as { name: string; label?: string; stars: number }[];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('hero', async ({ page }) => {
  const hero = page.locator('#hero');
  await expect(hero.locator('h1')).toHaveText('Aleksandr Letunov');
  await expect(hero).toContainText('DevSecOps & Platform Engineering Tech Lead');
  await expect(hero).toContainText(
    'I built the IaC platform hundreds of repositories run on, and I build Claude Code agents for infrastructure work.',
  );
  await expect(hero.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', '/cv.pdf');
  await expect(hero.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:a.b.letunov@gmail.com');
  await expect(hero).toContainText('open to relocation');
});

test('work cards show app icons', async ({ page }) => {
  await expect(page.locator('#work .card .app-icon')).toHaveCount(6);
});

test('impact', async ({ page }) => {
  await expect(page.locator('#impact li b')).toHaveText(['600', '100+', '~20', '12 · 31']);
});

test('ai', async ({ page }) => {
  const ai = page.locator('#ai');
  await expect(ai.locator('.certs li')).toHaveCount(6);
  for (const name of ['Claude 101', 'Claude Code in Action', 'Model Context Protocol: Advanced topics']) {
    await expect(ai).toContainText(name);
  }
  await expect(ai.locator('a[href="https://github.com/flyoverhead/video-summary"]')).toHaveCount(1);
});

test('ai section describes plugins and daily use', async ({ page }) => {
  const ai = page.locator('#ai');
  await expect(ai.locator('.plugin h4')).toHaveText([
    'ansible', 'pre-commit', 'jira', 'terraform', 'golang', 'glab',
  ]);
  await expect(ai.locator('.plugin').first()).toContainText('molecule-scaffolder');
  await expect(ai.locator('.day li')).toHaveCount(5);
  await expect(ai.locator('.marketplace-stats')).toContainText('12 plugins');
  await expect(ai.locator('.marketplace-stats')).toContainText('31 skills');
  await expect(ai.locator('.marketplace-stats')).toContainText('6 agents');
});

test('oss', async ({ page }) => {
  const items = page.locator('#oss .repo');
  await expect(items).toHaveCount(snapshot.length);
  await expect(items.locator('.name')).toHaveText(snapshot.map((r) => r.label ?? r.name));
  await expect(items.first()).toContainText(`★ ${snapshot[0].stars}`);
  await expect(page.locator('#oss').getByRole('link', { name: /More on GitHub/ })).toHaveAttribute(
    'href',
    'https://github.com/flyoverhead',
  );
});

test('experience', async ({ page }) => {
  const exp = page.locator('#experience');
  await expect(exp.locator('.role')).toHaveCount(4);
  await expect(exp).toContainText('Before infrastructure');
  await expect(exp).toContainText('Tambov State University');
});

test('stack', async ({ page }) => {
  await expect(page.locator('#stack')).toContainText('Terraform / OpenTofu');
});

test.describe('no javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('content visible with JS disabled', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero', 'impact', 'work', 'ai', 'oss', 'experience', 'stack']) {
      await expect(page.locator(`#${id}`), id).toBeVisible();
    }
  });
});

test.describe('phone width', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('impact strip is 2 columns at 390px', async ({ page }) => {
    const boxes = await page.locator('#impact li').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect(boxes[0]).toBe(boxes[1]);
    expect(boxes[2]).toBeGreaterThan(boxes[0]);
  });
});
