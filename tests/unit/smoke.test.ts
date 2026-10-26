import { existsSync } from 'node:fs';
import { expect, test } from 'vitest';

test('build produces dist/index.html', () => {
  expect(existsSync('dist/index.html')).toBe(true);
});
