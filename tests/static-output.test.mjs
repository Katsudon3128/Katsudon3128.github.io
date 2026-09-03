import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(
  root,
  process.env.ASTRO_STATIC_OUTPUT_FIXTURES === "1" ? "dist-fixture" : "dist",
);

const requiredRoutes = [
  "/",
  "/about/",
  "/projects/",
  "/blog/",
  "/blog/building-products-end-to-end/",
  "/404.html",
];

function outputPath(route) {
  if (route === "/") return path.join(dist, "index.html");
  if (route.endsWith(".html")) return path.join(dist, route.slice(1));
  return path.join(dist, route.slice(1), "index.html");
}

async function readRoute(route) {
  return readFile(outputPath(route), "utf8");
}

function extractTag(html, tagName, accessibleName) {
  const pattern = new RegExp(
    `<${tagName}[^>]*aria-label=["']${accessibleName}["'][^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    "i",
  );
  return html.match(pattern)?.[1] ?? "";
}

function internalReferences(html) {
  return [...html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/gi)]
    .map((match) => match[1])
    .filter((href) => href.startsWith("/"));
}

async function assertRouteExists(route) {
  const info = await stat(outputPath(route));
  assert.ok(info.isFile(), `${route} 應產生公開 HTML`);
}

test("正式建置產生可導覽的主要路由", async () => {
  await Promise.all(requiredRoutes.map(assertRouteExists));
});

test("主要導覽、頁尾與網站標誌連結至公開頁面", async () => {
  for (const route of requiredRoutes) {
    const html = await readRoute(route);
    const primaryNav = extractTag(html, "nav", "主要導覽");
    const footerNav = extractTag(html, "nav", "頁尾導覽");

    assert.match(
      html,
      /<a[^>]*aria-label=["']回到首頁["'][^>]*href=["']\/["']/i,
    );
    for (const target of ["/", "/about/", "/projects/", "/blog/"]) {
      assert.ok(
        primaryNav.includes(`href=\"${target}\"`),
        `${route} 的主要導覽應包含 ${target}`,
      );
      assert.ok(
        footerNav.includes(`href=\"${target}\"`),
        `${route} 的頁尾導覽應包含 ${target}`,
      );
    }
  }
});

test("首頁依序呈現首屏、焦點專案、最近文章與最新想法", async () => {
  const html = await readRoute("/");
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const headings = [
    "把 Web 軟體產品，從概念做到上線。",
    "焦點專案",
    "最近文章",
    "最新想法",
  ];
  const positions = headings.map((heading) => main.indexOf(heading));

  assert.ok(
    positions.every((position) => position >= 0),
    "首頁應呈現全部四個內容區段",
  );
  assert.deepEqual(
    [...positions].sort((a, b) => a - b),
    positions,
    "首頁內容順序應符合規格",
  );
  assert.ok((main.match(/aria-label=\"焦點專案：/g) ?? []).length <= 3);
  assert.ok((main.match(/aria-label=\"最近文章：/g) ?? []).length <= 3);
  assert.equal(
    (main.match(/<article[^>]*aria-label=\"最新想法\"/g) ?? []).length,
    1,
  );
});

test("所有公開頁面的站內連結與本機素材都能對應正式建置輸出", async () => {
  for (const route of requiredRoutes) {
    const html = await readRoute(route);
    for (const reference of internalReferences(html)) {
      const target = path.extname(reference)
        ? path.join(dist, reference.slice(1))
        : outputPath(reference);
      const info = await stat(target);
      assert.ok(info.isFile(), `${route} 引用的 ${reference} 應存在`);
    }
  }
});

test("404 提供回復導覽且不載入滿版封面圖片", async () => {
  const html = await readRoute("/404.html");

  assert.match(html, /找不到這個頁面/);
  assert.match(html, /href=\"\/\"[^>]*>回首頁</);
  assert.doesNotMatch(html, /class=\"[^\"]*full-bleed-hero/);
  assert.doesNotMatch(html, /<img[^>]*data-full-bleed-cover/);
});

test("關於我頁面依序呈現完整資歷，並提供三種聯絡管道", async () => {
  const html = await readRoute("/about/");
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const headings = [
    "個人背景與工作取向",
    "工作經歷",
    "從 0 到 1 的能力範圍",
    "常用技術",
    "工作原則",
    "聯絡管道",
  ];
  const positions = headings.map((heading) => main.indexOf(heading));

  assert.ok(
    positions.every((position) => position >= 0),
    "關於我應呈現全部六個資歷區段",
  );
  assert.deepEqual(
    [...positions].sort((a, b) => a - b),
    positions,
    "關於我內容順序應符合規格",
  );
  assert.match(main, /<article[^>]*aria-label="工作經歷：[^"]+"/);
  assert.match(main, /<h3[^>]*>[^<]+<\/h3>/);
  assert.match(main, /<p[^>]*data-experience-role[^>]*>[^<]+<\/p>/);
  assert.match(main, /<time datetime="\d{4}-\d{2}"[^>]*>\d{4}\.\d{2}<\/time>/);
  assert.match(main, /主要責任/);
  assert.match(main, /代表成果/);
  assert.match(main, /從業年資/);

  assert.match(html, /href="mailto:[^"]+"/);
  assert.match(html, /href="https:\/\/github\.com\/[^"]+"/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/[^"]+"/);
  assert.doesNotMatch(html, /<form\b/i);
});

test("關於我首屏顯示可替換虛擬人像與獨立 metadata", async () => {
  const html = await readRoute("/about/");

  assert.match(html, /<title>關於我｜查理林｜資深 Web 軟體工程師<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/katsudon3128\.github\.io\/about\/">/,
  );
  assert.match(html, /<meta property="og:title" content="[^"]+">/);
  assert.match(html, /<meta property="og:description" content="[^"]+">/);
  assert.match(
    html,
    /<section[^>]*style="[^"]*--overlay-opacity: 0\.\d+[^"]*"[^>]*>/,
  );
  assert.match(
    html,
    /<img[^>]*data-virtual-portrait[^>]*src="\/assets\/avatar-about\.svg"[^>]*alt="[^"]+"[^>]*width="\d+"[^>]*height="\d+"[^>]*>/,
  );
});

test("專案頁顯示可在新分頁開啟的展示專案", async () => {
  const html = await readRoute("/projects/");

  assert.match(html, /aria-label="展示專案：[^"]+"/);
  assert.match(
    html,
    /href="https:\/\/github\.com\/[^"]+" target="_blank" rel="noreferrer"/,
  );
  assert.match(html, /(?:開發中|維護中|已封存)/);
});

test("展示專案輸出焦點選取、限定狀態、外部連結與響應式圖片", async () => {
  const homeHtml = await readRoute("/");
  const projectsHtml = await readRoute("/projects/");
  const featuredNames = [
    "Namemo 名字備忘錄",
    "PTT Watcher 2",
    "Fuwari 部落格模板",
  ];

  assert.equal(
    (homeHtml.match(/aria-label="焦點專案：/g) ?? []).length,
    featuredNames.length,
  );
  for (const name of featuredNames) {
    assert.match(homeHtml, new RegExp(`aria-label="焦點專案：${name}"`));
  }
  assert.doesNotMatch(homeHtml, /aria-label="焦點專案：PTT Watcher"/);

  const cards = [
    ...projectsHtml.matchAll(
      /<article[^>]*aria-label="展示專案：[^"]+"[^>]*>([\s\S]*?)<\/article>/g,
    ),
  ];
  assert.equal(cards.length, 4);
  const githubUrls = new Set();
  for (const [, card] of cards) {
    const status = card.match(
      /<span[^>]*class="status"[^>]*>([^<]+)<\/span>/,
    )?.[1];
    assert.ok(["開發中", "維護中", "已封存"].includes(status));
    assert.match(
      card,
      /<img[^>]*alt="[^"]+"[^>]*width="\d+"[^>]*height="\d+"[^>]*loading="lazy"[^>]*sizes="[^"]+"[^>]*>/,
    );
    assert.match(
      card,
      /<a[^>]*href="https:\/\/github\.com\/[^"]+"[^>]*target="_blank"[^>]*rel="noreferrer"[^>]*>[\s\S]*在新分頁開啟/,
    );
    const githubUrl = card.match(
      /href="(https:\/\/github\.com\/Katsudon3128\/[^/"]+)"/,
    )?.[1];
    assert.ok(githubUrl, "每個展示專案應連到個別儲存庫，而非個人首頁");
    githubUrls.add(githubUrl);
  }
  assert.equal(githubUrls.size, cards.length, "展示專案應有各自的儲存庫 URL");
});

test("部落格頁能開啟示例文章並閱讀 Markdown 正文", async () => {
  const firstPageHtml = await readRoute("/blog/");
  const listHtml =
    process.env.ASTRO_STATIC_OUTPUT_FIXTURES === "1"
      ? `${firstPageHtml}${await readRoute("/blog/page/2/")}`
      : firstPageHtml;
  const articleHtml = await readRoute("/blog/building-products-end-to-end/");

  assert.match(listHtml, /href="\/blog\/building-products-end-to-end\/"/);
  assert.match(
    articleHtml,
    /<h1[^>]*>從概念到上線：我如何拆解 Web 軟體產品<\/h1>/,
  );
  assert.match(
    articleHtml,
    /<h2[^>]*id="先定義可觀察的成果"[^>]*>先定義可觀察的成果<\/h2>/,
  );
});

test("部落格文章列表將中央圖片鍵解析為可用的縮圖", async () => {
  const html = await readRoute("/blog/");
  const thumbnail = html.match(
    /<article class="article-row article-row--with-cover"[^>]*>\s*<img([^>]*)>/,
  )?.[1];

  assert.ok(thumbnail, "文章列表應輸出縮圖");
  const source = thumbnail.match(/\bsrc="([^"]+)"/)?.[1];
  assert.match(source ?? "", /^\/_astro\/product-flow\.[^"]+\.webp$/);
  assert.match(thumbnail, /\bsrcset="[^"]+ 480w,[^"]+ 800w,[^"]+ 1200w"/);
  assert.match(thumbnail, /\bsizes="[^"]+"/);
  assert.match(thumbnail, /\bloading="lazy"/);
  await stat(path.join(dist, source.slice(1)));
});

test("文章頁輸出獨立 metadata、結構化資料與閱讀時間", async () => {
  const html = await readRoute("/blog/building-products-end-to-end/");

  assert.match(
    html,
    /<title>從概念到上線：我如何拆解 Web 軟體產品｜查理林｜資深 Web 軟體工程師<\/title>/,
  );
  assert.match(
    html,
    /<meta name="description" content="以可驗證的垂直切片，把模糊概念逐步帶到能被使用的正式產品。">/,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/katsudon3128\.github\.io\/blog\/building-products-end-to-end\/">/,
  );
  assert.match(html, /<meta property="og:type" content="article">/);
  assert.match(
    html,
    /<meta property="og:url" content="https:\/\/katsudon3128\.github\.io\/blog\/building-products-end-to-end\/">/,
  );
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/katsudon3128\.github\.io\/_astro\/product-flow\.[^"]+\.webp">/,
  );
  assert.match(
    html,
    /<meta property="article:published_time" content="[^"]+">/,
  );
  assert.match(html, /<meta property="article:modified_time" content="[^"]+">/);
  assert.match(html, /<meta property="article:tag" content="產品開發">/);
  assert.match(
    html,
    /<script type="application\/ld\+json">[\s\S]*"@type":"BlogPosting"/,
  );
  assert.match(
    html,
    /<span[^>]*data-reading-time[^>]*>閱讀時間 1 分鐘<\/span>/,
  );
});

test("文章頁完整呈現技術 Markdown，並妥善載入文章圖片", async () => {
  const html = await readRoute("/blog/building-products-end-to-end/");

  assert.match(
    html,
    /<img[^>]*data-article-cover[^>]*width="1200"[^>]*height="600"[^>]*loading="eager"[^>]*decoding="async"[^>]*fetchpriority="high"[^>]*srcset="[^"]+ 480w,[^"]+ 800w,[^"]+ 1200w"[^>]*sizes="[^"]+"[^>]*>/,
  );
  assert.match(html, /<h3[^>]*id="可重複的發布步驟"[^>]*>/);
  assert.match(
    html,
    /<a href="https:\/\/docs\.astro\.build\/">Astro 文件<\/a>/,
  );
  assert.match(
    html,
    /<table>[\s\S]*<th>階段<\/th>[\s\S]*<td>建置<\/td>[\s\S]*<\/table>/,
  );
  assert.match(html, /<pre[^>]*class="[^"]*astro-code[^"]*"[^>]*>[\s\S]*const/);
  assert.match(
    html,
    /<img[^>]*src="\/_astro\/product-flow\.[^"]+\.webp"[^>]*alt="垂直切片流程示意圖"[^>]*width="1200"[^>]*height="600"[^>]*loading="lazy"[^>]*decoding="async"[^>]*srcset="[^"]+ 480w,[^"]+ 800w,[^"]+ 1200w"[^>]*sizes="[^"]+"[^>]*>/,
  );
});

test("正式建置從文章路由與公開文章索引完整排除草稿", async () => {
  const draftRoute = "/blog/draft-workflow-preview/";

  await assert.rejects(stat(outputPath(draftRoute)), { code: "ENOENT" });
  for (const route of ["/", "/blog/"]) {
    const html = await readRoute(route);
    assert.doesNotMatch(html, /draft-workflow-preview/);
    assert.doesNotMatch(html, /發布流程草稿預覽/);
  }
});

test("部落格依發布日期分成每頁最多十篇的靜態頁面", async () => {
  const firstPage = await readRoute("/blog/");
  const secondPage = await readRoute("/blog/page/2/");

  assert.equal(
    (firstPage.match(/<article[^>]*aria-label="文章摘要：/g) ?? []).length,
    10,
  );
  assert.equal(
    (secondPage.match(/<article[^>]*aria-label="文章摘要：/g) ?? []).length,
    1,
  );
  assert.ok(
    firstPage.indexOf("分頁測試文章 10") < firstPage.indexOf("分頁測試文章 09"),
  );
  assert.match(secondPage, /從概念到上線：我如何拆解 Web 軟體產品/);
  assert.match(firstPage, /class="[^"]*full-bleed-hero/);
  assert.doesNotMatch(secondPage, /class="[^"]*full-bleed-hero/);
  assert.match(secondPage, /<nav[^>]*aria-label="文章分頁"/);
});

test("標籤連結產生可分享且同樣遵守十篇邊界的靜態列表", async () => {
  const blog = await readRoute("/blog/");
  const firstTagPage = await readRoute("/blog/tags/product-development/");
  const secondTagPage = await readRoute(
    "/blog/tags/product-development/page/2/",
  );
  const singlePageTag = await readRoute("/blog/tags/software-design/");

  assert.match(blog, /href="\/blog\/tags\/product-development\/"/);
  assert.equal(
    (firstTagPage.match(/<article[^>]*aria-label="文章摘要：/g) ?? []).length,
    10,
  );
  assert.equal(
    (secondTagPage.match(/<article[^>]*aria-label="文章摘要：/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(firstTagPage, /class="[^"]*full-bleed-hero/);
  assert.doesNotMatch(singlePageTag, /aria-label="文章分頁"/);

  const productDevelopmentPages = `${firstTagPage}${secondTagPage}`;
  for (let fixture = 1; fixture <= 10; fixture += 1) {
    assert.match(
      productDevelopmentPages,
      new RegExp(`/blog/fixture-article-${String(fixture).padStart(2, "0")}/`),
    );
  }
  assert.match(
    productDevelopmentPages,
    /\/blog\/building-products-end-to-end\//,
  );
  assert.match(singlePageTag, /\/blog\/building-products-end-to-end\//);
  assert.doesNotMatch(singlePageTag, /\/blog\/fixture-article-/);
  await assert.rejects(stat(outputPath("/blog/tags/publishing-workflow/")), {
    code: "ENOENT",
  });
});

test("首頁自動顯示三篇最新文章的純文字摘要", async () => {
  const html = await readRoute("/");
  const recentPosts =
    html.match(
      /<section[^>]*aria-labelledby="recent-posts-title"[^>]*>([\s\S]*?)<\/section>/,
    )?.[1] ?? "";

  assert.equal(
    (recentPosts.match(/<article[^>]*aria-label="最近文章：/g) ?? []).length,
    3,
  );
  assert.ok(
    recentPosts.indexOf("分頁測試文章 10") <
      recentPosts.indexOf("分頁測試文章 09"),
  );
  assert.ok(
    recentPosts.indexOf("分頁測試文章 09") <
      recentPosts.indexOf("分頁測試文章 08"),
  );
  assert.doesNotMatch(recentPosts, /<img\b/);
});

test("部落格列表、標籤頁與分頁輸出獨立 metadata", async () => {
  const cases = [
    ["/blog/", "部落格｜查理林｜資深 Web 軟體工程師"],
    ["/blog/page/2/", "部落格第 2 頁｜查理林｜資深 Web 軟體工程師"],
    [
      "/blog/tags/product-development/",
      "產品開發文章｜查理林｜資深 Web 軟體工程師",
    ],
    [
      "/blog/tags/product-development/page/2/",
      "產品開發文章第 2 頁｜查理林｜資深 Web 軟體工程師",
    ],
  ];

  for (const [route, title] of cases) {
    const html = await readRoute(route);
    assert.match(html, new RegExp(`<title>${title}</title>`));
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.ok(
      html.includes(
        `<link rel="canonical" href="https://katsudon3128.github.io${route}">`,
      ),
    );
  }
});

test("RSS 使用正式網址且只列出正式文章", async () => {
  const rss = await readFile(path.join(dist, "rss.xml"), "utf8");

  assert.match(rss, /<link>https:\/\/katsudon3128\.github\.io\/<\/link>/);
  assert.match(
    rss,
    /<link>https:\/\/katsudon3128\.github\.io\/blog\/fixture-article-10\/<\/link>/,
  );
  assert.doesNotMatch(rss, /draft-workflow-preview/);
  assert.doesNotMatch(rss, /發布流程草稿預覽/);
});

test("sitemap 涵蓋正式列表、文章與標籤頁並排除草稿", async () => {
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");

  for (const route of [
    "/blog/",
    "/blog/page/2/",
    "/blog/fixture-article-10/",
    "/blog/tags/product-development/",
    "/blog/tags/product-development/page/2/",
  ]) {
    assert.ok(
      sitemap.includes(`<loc>https://katsudon3128.github.io${route}</loc>`),
      `sitemap 應包含 ${route}`,
    );
  }
  assert.doesNotMatch(sitemap, /draft-workflow-preview/);
  assert.doesNotMatch(sitemap, /404/);
});
