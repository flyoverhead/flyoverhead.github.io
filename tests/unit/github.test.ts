import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import { fetchRepos, GitHubError, updateSnapshot } from '../../src/lib/github';

const repoJson = (name: string, stars: number) => ({
  name,
  description: `${name} desc`,
  language: 'Go',
  stargazers_count: stars,
  html_url: `https://github.com/flyoverhead/${name}`,
});

const stubFetch = (byName: Record<string, number | object>) =>
  (async (url: string) => {
    const name = url.split('/').pop()!;
    const v = byName[name];
    if (typeof v === 'number') return new Response('{}', { status: v });
    return new Response(JSON.stringify(v), { status: 200 });
  }) as unknown as typeof fetch;

describe('fetchRepos', () => {
  test('maps fields and keeps curated order', async () => {
    const f = stubFetch({ b: repoJson('b', 2), a: repoJson('a', 22) });
    const repos = await fetchRepos([{ name: 'b' }, { name: 'a', label: 'ns.a' }], { owner: 'flyoverhead', fetch: f });
    expect(repos).toEqual([
      { name: 'b', description: 'b desc', language: 'Go', stars: 2, url: 'https://github.com/flyoverhead/b' },
      { name: 'a', label: 'ns.a', description: 'a desc', language: 'Go', stars: 22, url: 'https://github.com/flyoverhead/a' },
    ]);
  });

  test('skips a 404 repo with a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const repos = await fetchRepos([{ name: 'gone' }, { name: 'a' }], {
      owner: 'flyoverhead',
      fetch: stubFetch({ gone: 404, a: repoJson('a', 1) }),
    });
    expect(repos.map((r) => r.name)).toEqual(['a']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('gone'));
    warn.mockRestore();
  });

  test('throws GitHubError on 403 rate limit', async () => {
    await expect(
      fetchRepos([{ name: 'a' }], { owner: 'flyoverhead', fetch: stubFetch({ a: 403 }) }),
    ).rejects.toBeInstanceOf(GitHubError);
  });

  test('throws GitHubError on network failure', async () => {
    const f = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    await expect(fetchRepos([{ name: 'a' }], { owner: 'flyoverhead', fetch: f })).rejects.toBeInstanceOf(GitHubError);
  });
});

describe('updateSnapshot', () => {
  test('keeps snapshot on GitHubError', async () => {
    const path = join(mkdtempSync(join(tmpdir(), 'snap-')), 'repos.snapshot.json');
    writeFileSync(path, '[{"name":"old"}]');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await updateSnapshot({
      refs: [{ name: 'a' }],
      owner: 'flyoverhead',
      path,
      fetch: stubFetch({ a: 429 }),
    });
    expect(result).toBe('kept');
    expect(readFileSync(path, 'utf8')).toBe('[{"name":"old"}]');
    expect(log).toHaveBeenCalledWith(expect.stringContaining('using committed snapshot'));
    log.mockRestore();
  });

  test('writes snapshot on success', async () => {
    const path = join(mkdtempSync(join(tmpdir(), 'snap-')), 'repos.snapshot.json');
    const result = await updateSnapshot({ refs: [{ name: 'a' }], owner: 'flyoverhead', path, fetch: stubFetch({ a: repoJson('a', 5) }) });
    expect(result).toBe('updated');
    expect(JSON.parse(readFileSync(path, 'utf8'))[0].stars).toBe(5);
  });
});
