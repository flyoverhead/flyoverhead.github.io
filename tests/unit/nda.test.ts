import { globSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { BUILTIN_PATTERNS, loadDenylist, scanForbidden } from '../../src/lib/nda';

const tmp = () => mkdtempSync(join(tmpdir(), 'nda-'));

describe('scanForbidden', () => {
  test('flags a phone number', () => {
    const f = join(tmp(), 'a.txt');
    writeFileSync(f, 'call +7 900 123 45 67\n');
    const hits = scanForbidden([f], BUILTIN_PATTERNS);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ file: f, line: 1 });
  });

  test('flags denylist terms case-insensitively', () => {
    const dir = tmp();
    writeFileSync(join(dir, 'deny.txt'), 'internal-host\n');
    writeFileSync(join(dir, 'b.txt'), 'see Internal-Host.example\n');
    expect(scanForbidden([join(dir, 'b.txt')], loadDenylist(join(dir, 'deny.txt')))).toHaveLength(1);
  });

  test('ignores comments and blank lines in denylist', () => {
    const dir = tmp();
    writeFileSync(join(dir, 'deny.txt'), '# comment\n\nsecret-term\n');
    expect(loadDenylist(join(dir, 'deny.txt'))).toHaveLength(1);
  });

  test('denylist hits are reported by index, never by term', () => {
    const dir = tmp();
    writeFileSync(join(dir, 'deny.txt'), 'first-term\nsecret-term\n');
    writeFileSync(join(dir, 'b.txt'), 'leaks secret-term here\n');
    const hits = scanForbidden([join(dir, 'b.txt')], [...BUILTIN_PATTERNS, ...loadDenylist(join(dir, 'deny.txt'))]);
    expect(hits).toEqual([{ file: join(dir, 'b.txt'), line: 1, pattern: 'denylist#2' }]);
  });

  test('empty denylist throws', () => {
    const p = join(tmp(), 'empty.txt');
    writeFileSync(p, '# only a comment\n\n');
    expect(() => loadDenylist(p)).toThrow(`NDA denylist is empty: ${p}`);
  });

  test('missing denylist throws', () => {
    const p = join(tmp(), 'nope.txt');
    expect(() => loadDenylist(p)).toThrow(`NDA denylist not found: ${p}`);
  });
});

test('repo sources are clean', () => {
  const files = globSync(['src/**/*', 'public/**/*', 'scripts/**/*', 'README.md'], { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name));
  expect(files.length).toBeGreaterThan(5);
  expect(scanForbidden(files, [...BUILTIN_PATTERNS, ...loadDenylist()])).toEqual([]);
});
