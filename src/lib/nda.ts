import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface NdaHit {
  file: string;
  line: number;
  pattern: string;
}

export const BUILTIN_PATTERNS: RegExp[] = [
  /(\+7|\b8)[\s-]?\(?9\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/,
];

const DEFAULT_DENYLIST = join(homedir(), '.config', 'flyoverhead-site', 'nda-denylist.txt');

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Denylist lines are literal terms, not regexes, so dots in hostnames stay literal.
export function loadDenylist(path = process.env.NDA_DENYLIST_FILE ?? DEFAULT_DENYLIST): RegExp[] {
  if (!existsSync(path)) {
    throw new Error(`NDA denylist not found: ${path}`);
  }
  const terms = readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => new RegExp(escape(l), 'i'));
  if (terms.length === 0) {
    throw new Error(`NDA denylist is empty: ${path}`);
  }
  return terms;
}

// Denylist hits report an index, not the term: test output lands in public CI logs.
const label = (p: RegExp, patterns: RegExp[]) =>
  BUILTIN_PATTERNS.includes(p) ? p.source : `denylist#${patterns.filter((q) => !BUILTIN_PATTERNS.includes(q)).indexOf(p) + 1}`;

export function scanForbidden(files: string[], patterns: RegExp[]): NdaHit[] {
  const hits: NdaHit[] = [];
  for (const file of files) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((text, i) => {
        for (const p of patterns) {
          if (p.test(text)) hits.push({ file, line: i + 1, pattern: label(p, patterns) });
        }
      });
  }
  return hits;
}
