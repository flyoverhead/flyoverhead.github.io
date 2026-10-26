import { expect, test } from '@playwright/test';

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
  await expect(hero.getByRole('link')).toHaveText(['GitHub', 'LinkedIn']);
  await expect(hero).not.toContainText('relocation');
  await expect(hero).not.toContainText('UTC');
});

test('impact', async ({ page }) => {
  await expect(page.locator('#impact li b')).toHaveText(['600', '100+', '~20', '12 · 31']);
});

test('work shows two cards with icons and no links', async ({ page }) => {
  const cards = page.locator('#work .card');
  await expect(cards.locator('h3')).toHaveText(['Greenfield IaC platform', 'AI plugin marketplace']);
  await expect(cards.locator('.app-icon')).toHaveCount(2);
  await expect(cards.locator('p')).toHaveCount(2);
  await expect(page.locator('#work a')).toHaveCount(0);
});

test('ai keeps the lead paragraph and marketplace counts only', async ({ page }) => {
  const ai = page.locator('#ai');
  await expect(ai.locator('p.lead')).toContainText('I use Claude Code as an everyday engineering tool');
  await expect(ai.locator('.stat')).toHaveText(['12 plugins', '31 skills', '6 agents']);
  await expect(ai.locator('h3')).toHaveCount(0);
  await expect(ai.locator('a')).toHaveCount(0);
});

test('oss is a summary linking to the GitHub profile', async ({ page }) => {
  const oss = page.locator('#oss');
  await expect(oss.locator('p').first()).toContainText('Ansible collections');
  await expect(oss.locator('li')).toHaveCount(0);
  await expect(oss.getByRole('link')).toHaveAttribute('href', 'https://github.com/flyoverhead');
});

test('experience is gone', async ({ page }) => {
  await expect(page.locator('#experience')).toHaveCount(0);
});

test('stack', async ({ page }) => {
  await expect(page.locator('#stack')).toContainText('Terraform / OpenTofu');
});

test.describe('no javascript', () => {
  test.use({ javaScriptEnabled: false });
  test('content visible with JS disabled', async ({ page }) => {
    await page.goto('/');
    for (const id of ['hero', 'impact', 'work', 'ai', 'oss', 'stack']) {
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
