import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { parse } from 'yaml';

const DIR = 'src/content/work';
const ALLOWED_OUTCOMES = [
  '600', '100+', '~20', '2×', '15–20 → 7–10 min', 'weeks → days', 'a week → a day',
  '2–3 min → 30 s', '1 API call', 'zero downtime', '4', '8', '20+',
  '22', '3', '53', '~70%',
];

const entries = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(`${DIR}/${f}`, 'utf8');
      const fm = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!fm) throw new Error(`${f}: no frontmatter`);
      return { id: f.replace(/\.md$/, ''), data: parse(fm[1]), body: fm[2] };
    });

test('six entries with unique order 1..6', () => {
  const es = entries();
  expect(es.map((e) => e.id).sort()).toEqual(
    ['ai-marketplace', 'go-services', 'ha-migrations', 'iac-platform', 'k8s-openstack', 'vault-scopes'],
  );
  expect(es.map((e) => e.data.order).sort()).toEqual([1, 2, 3, 4, 5, 6]);
});

test('order and employer follow the spec', () => {
  const byId = Object.fromEntries(entries().map((e) => [e.id, e.data]));
  expect(['iac-platform', 'ai-marketplace', 'k8s-openstack', 'ha-migrations', 'go-services', 'vault-scopes'].map((id) => byId[id].order))
    .toEqual([1, 2, 3, 4, 5, 6]);
  for (const [id, d] of Object.entries(byId)) {
    expect(d.employer, id).toBe(id === 'ha-migrations' ? 'RusBITech-Astra' : 'Positive Technologies');
  }
});

test('every outcome value appears in the Facts appendix', () => {
  for (const e of entries()) {
    for (const o of e.data.outcome) expect(ALLOWED_OUTCOMES, `${e.id}: ${o.value}`).toContain(o.value);
  }
});

test('bodies have problem and what-I-did sections under 250 words', () => {
  for (const e of entries()) {
    expect(e.body, e.id).toMatch(/^## problem$/m);
    expect(e.body, e.id).toMatch(/^## what I did$/m);
    expect(e.body.split(/\s+/).filter(Boolean).length, e.id).toBeLessThan(250);
  }
});
