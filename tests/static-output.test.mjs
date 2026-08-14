import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");

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
  const listHtml = await readRoute("/blog/");
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
