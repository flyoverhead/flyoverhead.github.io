import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { loadSiteData } from '../../src/lib/data';

describe('loadSiteData', () => {
  test('loads and validates all data files', () => {
    expect(() => loadSiteData()).not.toThrow();
  });

  test('profile copy matches spec', () => {
    const { profile } = loadSiteData();
    expect(profile.title).toBe('Platform Engineering Lead · IaC, DevSecOps & AI');
    expect(profile.pitch).toBe(
      'I build and lead the IaC platform ~680 repositories run on, secure it by default, and make it work with AI agents.',
    );
  });

  test('metrics match spec', () => {
    const { metrics } = loadSiteData();
    expect(metrics.map((m) => m.value)).toEqual(['~680', '~80', '21', '11 · 58']);
    expect(metrics.map((m) => m.label)).toEqual([
      'repos on the platform',
      'Ansible roles',
      'CI components I created',
      'AI plugins · eval suites',
    ]);
  });

  test('rejects invalid data naming the file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-data-'));
    cpSync('src/data', dir, { recursive: true });
    writeFileSync(
      join(dir, 'profile.yaml'),
      'name: X\ntitle: Y\nlinks:\n  github: https://g\n  linkedin: https://l\n',
    );
    expect(() => loadSiteData(dir)).toThrow(/profile\.yaml/);
  });

  test('profile has only github and linkedin links', () => {
    const { profile } = loadSiteData();
    expect(Object.keys(profile.links)).toEqual(['github', 'linkedin']);
    expect(profile).not.toHaveProperty('pills');
  });

  test('selected work covers platform, security, AI and images', () => {
    const { work } = loadSiteData();
    expect(work.map((w) => w.title)).toEqual(['IaC platform & CI components', 'Least-privilege CI & signed artifacts', 'AI-operable infrastructure', 'Golden-image factory']);
    expect(work.map((w) => w.kind)).toEqual(['platform', 'security', 'ai', 'reliability']);
    for (const w of work) expect(w.oneLiner.length, w.title).toBeGreaterThan(20);
  });
});
