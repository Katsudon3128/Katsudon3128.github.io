import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { articleImageKeys } from "./config/articleImages";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: z
    .object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string().trim().min(1)).min(1),
      cover: z.enum(articleImageKeys),
      coverAlt: z.string().trim().min(1),
      draft: z.boolean().default(false),
      showLineNumbers: z.boolean().default(false),
    })
    .refine(
      ({ publishedAt, updatedAt }) =>
        !updatedAt || updatedAt.valueOf() >= publishedAt.valueOf(),
      {
        message: "updatedAt 不得早於 publishedAt",
        path: ["updatedAt"],
      },
    ),
});

export const collections = { blog };
