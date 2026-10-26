import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { z } from 'astro/zod';
import { parse } from 'yaml';
import {
  certificateSchema,
  experienceSchema,
  metricSchema,
  pluginSchema,
  profileSchema,
  repoRefSchema,
  stackGroupSchema,
  type Certificate,
  type Experience,
  type Metric,
  type Plugin,
  type Profile,
  type RepoRef,
  type StackGroup,
} from './schema.ts';

export interface SiteData {
  profile: Profile;
  metrics: Metric[];
  experience: Experience;
  certificates: Certificate[];
  stack: StackGroup[];
  repos: RepoRef[];
  plugins: Plugin[];
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
    profile: load(dir, 'profile.yaml', profileSchema),
    metrics: load(dir, 'metrics.yaml', metricSchema.array()),
    experience: load(dir, 'experience.yaml', experienceSchema),
    certificates: load(dir, 'certificates.yaml', certificateSchema.array()),
    stack: load(dir, 'stack.yaml', stackGroupSchema.array()),
    repos: load(dir, 'repos.yaml', repoRefSchema.array()),
    plugins: load(dir, 'plugins.yaml', pluginSchema.array()),
  };
}
