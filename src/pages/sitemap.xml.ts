import { siteConfig } from "../config/site";
import {
  getPageCount,
  getPaginationPath,
  getTagListings,
} from "../utils/blogListings";
import { getPublishedPosts } from "../utils/getPublishedPosts";

export async function GET() {
  const posts = await getPublishedPosts();
  const routes = new Set(["/", "/about/", "/projects/", "/blog/"]);

  for (let page = 2; page <= getPageCount(posts); page += 1) {
    routes.add(getPaginationPath("/blog/", page));
  }

  for (const post of posts) {
    routes.add(`/blog/${post.data.slug}/`);
  }

  for (const { tag, posts: taggedPosts } of getTagListings(posts)) {
    const basePath = `/blog/tags/${tag.slug}/`;
    routes.add(basePath);
    for (let page = 2; page <= getPageCount(taggedPosts); page += 1) {
      routes.add(getPaginationPath(basePath, page));
    }
  }

  const urls = [...routes]
    .map(
      (route) => `<url><loc>${new URL(route, siteConfig.url).href}</loc></url>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
