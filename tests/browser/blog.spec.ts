import { expect, test } from "@playwright/test";

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
