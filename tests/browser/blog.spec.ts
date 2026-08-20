import { expect, test } from "@playwright/test";

test("長文在桌面顯示可用鍵盤操作的側欄目錄", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/blog/building-products-end-to-end/");

  const tableOfContents = page.getByRole("navigation", { name: "文章目錄" });
  await expect(tableOfContents).toBeVisible();
  await expect(tableOfContents.getByRole("link")).toHaveText([
    "先定義可觀察的成果",
    "用垂直切片降低風險",
    "可重複的發布步驟",
  ]);

  const targetLink = tableOfContents.getByRole("link", {
    name: "可重複的發布步驟",
  });
  await targetLink.focus();
  await page.keyboard.press("Enter");
  expect(decodeURIComponent(page.url())).toMatch(/#可重複的發布步驟$/);

  const target = page.getByRole("heading", {
    level: 3,
    name: "可重複的發布步驟",
  });
  const targetBox = await target.boundingBox();
  const headerBox = await page.locator(".site-header").boundingBox();
  expect(targetBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(targetBox!.y).toBeGreaterThanOrEqual(headerBox!.height);
});

test("長文在手機顯示可收合目錄，短文不顯示目錄", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/blog/building-products-end-to-end/");

  const mobileTableOfContents = page.locator("details", {
    hasText: "文章目錄",
  });
  const disclosure = mobileTableOfContents.getByText("文章目錄", {
    exact: true,
  });
  await expect(disclosure).toBeVisible();
  await expect(mobileTableOfContents).not.toHaveAttribute("open", "");
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(mobileTableOfContents).toHaveAttribute("open", "");
  await expect(
    page.getByRole("navigation", { name: "文章目錄" }),
  ).toBeVisible();

  await page.goto("/blog/draft-workflow-preview/");
  await expect(page.getByText("文章目錄", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "文章目錄" })).toHaveCount(
    0,
  );
});

test("讀者可複製語法高亮的程式碼並收到狀態回饋", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog/building-products-end-to-end/");

  const codeBlock = page.locator("[data-code-block]").first();
  await expect(
    codeBlock.locator("pre.astro-code[data-language='ts']"),
  ).toBeVisible();
  await expect(codeBlock.locator("code span[style]").first()).toBeVisible();

  await codeBlock.getByRole("button", { name: "複製程式碼" }).click();
  await expect(codeBlock.getByRole("status")).toHaveText("程式碼已複製");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'const articlePath = "/blog/building-products-end-to-end/";',
  );
});

test("文章可個別開啟行號，預設關閉時不保留行號空間", async ({ page }) => {
  await page.goto("/blog/building-products-end-to-end/");
  const defaultLine = page.locator(".astro-code .line").first();
  expect(
    await defaultLine.evaluate((line) =>
      getComputedStyle(line, "::before").getPropertyValue("content"),
    ),
  ).toBe("none");

  await page.goto("/blog/draft-workflow-preview/");
  const numberedLines = page.locator(".astro-code .line");
  await expect(numberedLines).toHaveCount(2);
  await expect(numberedLines.nth(0)).toHaveAttribute("data-line-number", "1");
  await expect(numberedLines.nth(1)).toHaveAttribute("data-line-number", "2");
  expect(
    await numberedLines
      .nth(0)
      .evaluate((line) =>
        getComputedStyle(line, "::before").getPropertyValue("content"),
      ),
  ).toBe('"1"');
});

test("文章底部依日期導覽相鄰文章並複製乾淨網址", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog/draft-workflow-preview/?utm_source=test");

  const footerNavigation = page.getByRole("navigation", {
    name: "文章延伸導覽",
  });
  await expect(
    footerNavigation.getByRole("link", {
      name: "上一篇：從概念到上線：我如何拆解 Web 軟體產品",
    }),
  ).toHaveAttribute("href", "/blog/building-products-end-to-end/");
  await expect(
    footerNavigation.getByRole("link", { name: /下一篇/ }),
  ).toHaveCount(0);
  await expect(
    footerNavigation.getByRole("link", { name: "返回部落格" }),
  ).toHaveAttribute("href", "/blog/");

  const share = page.locator("[data-article-actions]");
  await share.getByRole("button", { name: "複製文章連結" }).click();
  await expect(share.getByRole("status")).toHaveText("文章連結已複製");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "https://katsudon3128.github.io/blog/draft-workflow-preview/",
  );

  await page.goto("/blog/building-products-end-to-end/");
  const olderArticleNavigation = page.getByRole("navigation", {
    name: "文章延伸導覽",
  });
  await expect(
    olderArticleNavigation.getByRole("link", { name: /上一篇/ }),
  ).toHaveCount(0);
  await expect(
    olderArticleNavigation.getByRole("link", {
      name: "下一篇：發布流程草稿預覽",
    }),
  ).toHaveAttribute("href", "/blog/draft-workflow-preview/");
});

test("JavaScript 失效與 reduced motion 不阻斷長文閱讀", async ({
  browser,
  page,
}) => {
  const noScriptContext = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const noScriptPage = await noScriptContext.newPage();
  await noScriptPage.goto("/blog/building-products-end-to-end/");
  await expect(
    noScriptPage.getByRole("heading", {
      level: 1,
      name: "從概念到上線：我如何拆解 Web 軟體產品",
    }),
  ).toBeVisible();
  await expect(
    noScriptPage.getByRole("navigation", { name: "文章目錄" }),
  ).toBeVisible();
  await expect(noScriptPage.locator("pre.astro-code")).toBeVisible();
  await expect(noScriptPage.locator("[data-copy-code]")).toBeHidden();
  await expect(noScriptPage.locator("[data-copy-article-link]")).toBeHidden();
  await noScriptContext.close();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/blog/building-products-end-to-end/");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe("auto");
});

test("文章在 320px 至桌面寬度保持可讀且沒有頁面水平捲動", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 1280, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(
      `/blog/building-products-end-to-end/?width=${viewport.width}`,
    );

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.pageWidth).toBe(dimensions.viewportWidth);

    const article = page.getByRole("article");
    await expect(article.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(article.getByText("閱讀時間 1 分鐘")).toBeVisible();
    await expect(article.getByRole("table")).toBeVisible();

    const cover = article.locator("[data-article-cover]");
    const coverBox = await cover.boundingBox();
    expect(coverBox).not.toBeNull();
    expect(coverBox!.height).toBeLessThan(viewport.height * 0.75);
  }
});
