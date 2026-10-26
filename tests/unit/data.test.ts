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
    expect(profile.title).toBe('DevSecOps & Platform Engineering Tech Lead');
    expect(profile.pitch).toBe(
      'I built the IaC platform hundreds of repositories run on, and I build Claude Code agents for infrastructure work.',
    );
  });

  test('metrics match spec', () => {
    const { metrics } = loadSiteData();
    expect(metrics.map((m) => m.value)).toEqual(['600', '100+', '~20', '12 · 31']);
    expect(metrics.map((m) => m.label)).toEqual([
      'repos on the platform',
      'Ansible roles',
      'CI components',
      'Claude Code plugins · skills',
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

  test('selected work is the IaC platform and the AI marketplace', () => {
    const { work } = loadSiteData();
    expect(work.map((w) => w.title)).toEqual(['Greenfield IaC platform', 'AI plugin marketplace']);
    expect(work.map((w) => w.kind)).toEqual(['platform', 'ai']);
    for (const w of work) expect(w.oneLiner.length, w.title).toBeGreaterThan(20);
  });
});
