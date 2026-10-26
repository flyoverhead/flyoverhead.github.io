import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const PORT = 4330;
const base = `http://localhost:${PORT}`;

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore' });

async function waitForServer(): Promise<void> {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`preview server did not start on ${base}`);
}

try {
  await waitForServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ colorScheme: 'light' });

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(`${base}/og/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'dist/og.png', clip: { x: 0, y: 0, width: 1200, height: 630 } });

  await browser.close();
  console.log('rendered dist/og.png');
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  server.kill();
}
