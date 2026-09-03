import type { CollectionEntry } from "astro:content";
import { blogTags } from "../config/blogTags";

export const BLOG_PAGE_SIZE = 10;

export type BlogPost = CollectionEntry<"blog">;

export function paginatePosts(posts: BlogPost[], page: number) {
  const start = (page - 1) * BLOG_PAGE_SIZE;
  return posts.slice(start, start + BLOG_PAGE_SIZE);
}

export function getPageCount(posts: BlogPost[]) {
  return Math.max(1, Math.ceil(posts.length / BLOG_PAGE_SIZE));
}

export function getTagListings(posts: BlogPost[]) {
  return blogTags
    .map((tag) => ({
      tag,
      posts: posts.filter((post) => post.data.tags.includes(tag.label)),
    }))
    .filter(({ posts: taggedPosts }) => taggedPosts.length > 0);
}

export function getPaginationPath(basePath: string, page: number) {
  return page === 1 ? basePath : `${basePath}page/${page}/`;
}
