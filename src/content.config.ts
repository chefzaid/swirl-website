import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Resource articles, one Markdown file per language: src/content/articles/
// <lang>/<article>.md, where <article> is an id from `articles` in data/site.ts.
const articles = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/articles' }),
  schema: z.object({
    // Search title after the "Swirl | " brand prefix, and meta description.
    title: z.string().max(66),
    description: z.string().max(175),
    heading: z.string(),
    lead: z.string(),
    published: z.coerce.date(),
    updated: z.coerce.date(),
    sources: z.array(z.object({ label: z.string(), url: z.url() })).min(1),
  }),
});

export const collections = { articles };
