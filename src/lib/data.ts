import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { z } from 'astro/zod';
import { parse } from 'yaml';
import {
  metricSchema,
  profileSchema,
  stackGroupSchema,
  workSchema,
  type Metric,
  type Profile,
  type StackGroup,
  type Work,
} from './schema.ts';

export interface SiteData {
  profile: Profile;
  metrics: Metric[];
  work: Work[];
  stack: StackGroup[];
}

function load<T extends z.ZodType>(dir: string, file: string, schema: T): z.infer<T> {
  const result = schema.safeParse(parse(readFileSync(join(dir, file), 'utf8')));
  if (!result.success) {
    throw new Error(`${file}: ${result.error.message}`);
  }
  return result.data;
}

export function loadSiteData(dir = 'src/data'): SiteData {
  return {
    profile: load(dir, 'profile.yaml', profileSchema.strict()),
    metrics: load(dir, 'metrics.yaml', metricSchema.array()),
    work: load(dir, 'work.yaml', workSchema.array()),
    stack: load(dir, 'stack.yaml', stackGroupSchema.array()),
  };
}
