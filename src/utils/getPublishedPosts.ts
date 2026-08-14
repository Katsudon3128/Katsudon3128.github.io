import { getCollection } from "astro:content";

type BlogPostOptions = {
  includeDrafts?: boolean;
};

export async function getBlogPosts({
  includeDrafts = false,
}: BlogPostOptions = {}) {
  return (
    await getCollection("blog", ({ data }) => includeDrafts || !data.draft)
  ).sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

export function getPublishedPosts() {
  return getBlogPosts();
}
