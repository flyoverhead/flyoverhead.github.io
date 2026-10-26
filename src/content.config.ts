import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { metricSchema } from './lib/schema.ts';

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    oneLiner: z.string(),
    kind: z.string(),
    order: z.number().int().min(1).max(6),
    role: z.string(),
    period: z.string(),
    employer: z.enum(['Positive Technologies', 'RusBITech-Astra']),
    outcome: z.array(metricSchema).max(4),
    stack: z.array(z.string()),
    diagram: z.array(z.string()).min(2).max(6),
  }),
});

export const collections = { work };
