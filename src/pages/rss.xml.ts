import { siteConfig } from "../config/site";
import { getPublishedPosts } from "../utils/getPublishedPosts";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const url = new URL(`/blog/${post.data.slug}/`, siteConfig.url).href;
      const categories = post.data.tags
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("");
      return `<item><title>${escapeXml(post.data.title)}</title><description>${escapeXml(post.data.summary)}</description><link>${url}</link><guid>${url}</guid><pubDate>${post.data.publishedAt.toUTCString()}</pubDate>${categories}</item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(siteConfig.name)}</title><description>${escapeXml(siteConfig.description)}</description><link>${siteConfig.url}</link><language>zh-Hant</language>${items}</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
