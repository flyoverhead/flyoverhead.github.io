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

  test('six Claude Academy certificates', () => {
    const names = loadSiteData()
      .certificates.filter((c) => c.issuer === 'Claude Academy')
      .map((c) => c.name);
    expect(names).toEqual([
      'Claude 101',
      'Claude Code 101',
      'Claude Code in Action',
      'AI Fluency: Framework and foundations',
      'Introduction to Model Context Protocol',
      'Model Context Protocol: Advanced topics',
    ]);
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

  test('roles newest first', () => {
    const { roles } = loadSiteData().experience;
    expect(roles).toHaveLength(4);
    const starts = roles.map((r) => r.start);
    expect([...starts].sort().reverse()).toEqual(starts);
    expect(new Set(starts).size).toBe(4);
    expect(roles[0]).toMatchObject({
      title: 'DevOps Tech Lead',
      employer: 'Positive Technologies',
      start: '2025-05',
      end: null,
      team: 4,
    });
  });

  test('rejects invalid data naming the file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'site-data-'));
    cpSync('src/data', dir, { recursive: true });
    writeFileSync(
      join(dir, 'profile.yaml'),
      'name: X\ntitle: Y\npitch: Z\npills: []\nlinks:\n  github: https://g\n  linkedin: https://l\n',
    );
    expect(() => loadSiteData(dir)).toThrow(/profile\.yaml/);
  });

  test('featured plugins come from the team marketplace', () => {
    const { plugins } = loadSiteData();
    expect(plugins.map((p) => p.name)).toEqual([
      'ansible', 'pre-commit', 'jira', 'terraform', 'golang', 'glab',
    ]);
    for (const p of plugins) {
      expect(p.skills.length, p.name).toBeGreaterThan(0);
      expect(p.useCase.length, p.name).toBeGreaterThan(40);
    }
  });

  test('repos curation excludes forks', () => {
    const names = loadSiteData().repos.map((r) => r.name);
    expect(names).not.toContain('crdroid_12_kernel');
    expect(names).not.toContain('neutrino_kernel_oneplus_sm8250');
  });
});
