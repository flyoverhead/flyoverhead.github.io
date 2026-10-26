import { z } from 'astro/zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  pitch: z.string().min(1),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
  }),
});

export const metricSchema = z.object({ value: z.string().min(1), label: z.string().min(1) });

export const workSchema = z.object({
  title: z.string().min(1),
  kind: z.string().min(1),
  oneLiner: z.string().min(1),
});

export const stackGroupSchema = z.object({ group: z.string().min(1), items: z.array(z.string()).min(1) });

export type Profile = z.infer<typeof profileSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Work = z.infer<typeof workSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
