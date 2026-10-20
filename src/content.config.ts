import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const research = defineCollection({
	loader: glob({ base: './src/content/research', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		kind: z.enum(['cve', 'ctf']),
		tags: z.array(z.string()).default([]),
		// CVE entries
		cve: z.string().optional(),
		vendor: z.string().optional(),
		severity: z.string().optional(),
		advisory: z.string().url().optional(),
		repo: z.string().url().optional(),
		// CTF entries
		event: z.string().optional(),
	}),
});

export const collections = { research };
