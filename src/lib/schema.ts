import { z } from 'astro/zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  pitch: z.string().min(1),
  pills: z.array(z.string()),
  links: z.object({
    email: z.email(),
    github: z.url(),
    linkedin: z.url(),
  }),
});

export const metricSchema = z.object({ value: z.string().min(1), label: z.string().min(1) });

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/);

export const roleSchema = z.object({
  title: z.string().min(1),
  employer: z.string().min(1),
  start: yearMonth,
  end: yearMonth.nullable(),
  team: z.number().int().positive().optional(),
  summary: z.string().min(1),
  highlights: z.array(z.string()).default([]),
});

export const experienceSchema = z.object({
  roles: z.array(roleSchema).min(1),
  beforeInfra: z.object({ period: z.string(), text: z.string() }),
  education: z.object({ school: z.string(), degree: z.string(), period: z.string() }),
});

export const certificateSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  url: z.url().optional(),
});

export const stackGroupSchema = z.object({ group: z.string().min(1), items: z.array(z.string()).min(1) });

export const pluginSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  skills: z.array(z.string()).min(1),
  agents: z.array(z.string()).default([]),
  useCase: z.string().min(1),
  daily: z.boolean().default(false),
});

export const repoRefSchema = z.object({ name: z.string().min(1), label: z.string().optional() });

export type Profile = z.infer<typeof profileSchema>;
export type Metric = z.infer<typeof metricSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
export type RepoRef = z.infer<typeof repoRefSchema>;
export type Plugin = z.infer<typeof pluginSchema>;
