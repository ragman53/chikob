import { defineCollection, z } from 'astro:content';

// 1. Schema for the 'idea' collection (Essays, Articles)
const ideaCollection = defineCollection({
  type: 'content', // for .md, .mdx files
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
  }),
});

// 2. Schema for the 'craft' collection (Creative Works)
const craftCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    medium: z.string(), // e.g., "Music", "Graphic Design", "Video"
    year: z.number(),
    coverImage: z.string(),
  }),
});

// 3. Schema for the 'code' collection (Programming Projects)
const codeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    projectName: z.string(),
    status: z.enum(["In Progress", "Complete", "Archived"]),
    repoUrl: z.string().url().optional(),
    tags: z.array(z.string()),
  }),
});

const whoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(),
    email: z.string().email(),
    website: z.string().url(),
  }),
});


// 4. Export all collections from a single 'collections' object
export const collections = {
  'idea': ideaCollection,
  'craft': craftCollection,
  'code': codeCollection,
  'who': whoCollection,
};