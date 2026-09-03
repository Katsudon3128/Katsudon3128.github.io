import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { articleImageKeys } from "./config/articleImages";
import { getBlogTag } from "./config/blogTags";

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const includeStaticOutputFixtures =
  runtime.process?.env?.ASTRO_STATIC_OUTPUT_FIXTURES === "1";

const blog = defineCollection({
  loader: glob({
    pattern: includeStaticOutputFixtures
      ? ["src/data/blog/**/*.md", "tests/fixtures/blog/**/*.md"]
      : "src/data/blog/**/*.md",
    base: ".",
  }),
  schema: z
    .object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z
        .array(
          z
            .string()
            .trim()
            .min(1)
            .refine((tag) => getBlogTag(tag), "標籤必須定義於 blogTags"),
        )
        .min(1),
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
