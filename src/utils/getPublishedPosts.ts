import { getCollection } from "astro:content";

export async function getPublishedPosts() {
  return (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}
