import { expect, test } from "@playwright/test";

test("訪客可從專案頁操作不循環的手動輪播", async ({ page }) => {
  await page.goto("/projects/");

  const carousel = page.getByRole("region", { name: "展示專案輪播" });
  await expect(carousel).toBeVisible();
  await expect(carousel.getByRole("article")).toHaveCount(4);
  await expect(
    carousel.getByRole("button", { name: "上一個專案" }),
  ).toBeDisabled();
  await expect(
    carousel.getByRole("button", { name: "下一個專案" }),
  ).toBeEnabled();
});

test("專案輪播依桌面、平板與手機寬度顯示三、二、一張卡片", async ({ page }) => {
  const cases = [
    { width: 1200, fullCards: 3, peek: false },
    { width: 800, fullCards: 2, peek: false },
    { width: 390, fullCards: 1, peek: true },
  ];

  for (const layout of cases) {
    await page.setViewportSize({ width: layout.width, height: 900 });
    await page.goto(`/projects/?viewport=${layout.width}`);

    const cards = page
      .getByRole("region", { name: "展示專案輪播" })
      .getByRole("article");
    const boxes = await Promise.all(
      Array.from({ length: 4 }, (_, index) => cards.nth(index).boundingBox()),
    );
    const first = boxes[0];
    const firstOutside = boxes[layout.fullCards];

    expect(first).not.toBeNull();
    expect(firstOutside).not.toBeNull();
    const contentRight = layout.width - first!.x;
    const contentWidth = contentRight - first!.x;
    expect(first!.width).toBeGreaterThan(
      layout.peek ? contentWidth * 0.75 : contentWidth / (layout.fullCards + 1),
    );
    if (layout.peek) {
      expect(firstOutside!.x).toBeLessThan(contentRight);
      expect(firstOutside!.x + firstOutside!.width).toBeGreaterThan(
        contentRight,
      );
    } else {
      expect(firstOutside!.x).toBeGreaterThanOrEqual(contentRight);
    }
  }
});

test("首頁焦點專案依桌面、平板與手機寬度顯示三、二、一欄", async ({ page }) => {
  const cases = [
    { width: 1200, firstRowCards: 3 },
    { width: 800, firstRowCards: 2 },
    { width: 390, firstRowCards: 1 },
  ];

  for (const layout of cases) {
    await page.setViewportSize({ width: layout.width, height: 900 });
    await page.goto(`/?viewport=${layout.width}`);
    const cards = page.getByRole("article", { name: /焦點專案：/ });
    const boxes = await Promise.all(
      Array.from({ length: 3 }, (_, index) => cards.nth(index).boundingBox()),
    );
    const firstRowCards = boxes.filter(
      (box) => box && Math.abs(box.y - boxes[0]!.y) < 1,
    );

    expect(firstRowCards).toHaveLength(layout.firstRowCards);
  }
});

test("前後按鈕逐張移動並在輪播首尾停用", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/projects/?controls");

  const carousel = page.getByRole("region", { name: "展示專案輪播" });
  const cards = carousel.getByRole("article");
  const previous = carousel.getByRole("button", { name: "上一個專案" });
  const next = carousel.getByRole("button", { name: "下一個專案" });
  const initialX = (await cards.first().boundingBox())!.x;

  await next.click();
  await expect
    .poll(async () => (await cards.first().boundingBox())!.x)
    .toBeLessThan(initialX - 100);
  await expect(previous).toBeEnabled();

  for (let index = 2; index < (await cards.count()); index += 1) {
    await next.click();
  }
  await expect(next).toBeDisabled();
  await expect
    .poll(async () => (await cards.last().boundingBox())!.x)
    .toBeCloseTo(initialX, 0);

  await previous.click();
  await expect(next).toBeEnabled();
});

test("鍵盤使用者以左右方向鍵逐張瀏覽專案", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/projects/?keyboard");

  const carousel = page.getByRole("region", { name: "展示專案輪播" });
  const track = carousel.getByLabel("展示專案清單");
  const cards = carousel.getByRole("article");
  const initialX = (await cards.first().boundingBox())!.x;

  await track.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => (await cards.nth(1).boundingBox())!.x)
    .toBeCloseTo(initialX, 0);
  await expect(
    carousel.getByRole("button", { name: "上一個專案" }),
  ).toBeEnabled();

  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(async () => (await cards.first().boundingBox())!.x)
    .toBeCloseTo(initialX, 0);
  await expect(
    carousel.getByRole("button", { name: "上一個專案" }),
  ).toBeDisabled();
});

test("觸控使用者可滑動並逐張對齊專案", async ({ context, page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/projects/?touch");

  const carousel = page.getByRole("region", { name: "展示專案輪播" });
  const track = carousel.getByLabel("展示專案清單");
  const cards = carousel.getByRole("article");
  await track.scrollIntoViewIfNeeded();
  const trackBox = (await track.boundingBox())!;
  const initialX = (await cards.first().boundingBox())!.x;
  const y = trackBox.y + trackBox.height / 2;
  const startX = trackBox.x + trackBox.width - 24;
  const client = await context.newCDPSession(page);

  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  });
  for (const distance of [70, 140, 210, 280]) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX - distance, y }],
    });
  }
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  await expect
    .poll(async () => (await cards.nth(1).boundingBox())!.x)
    .toBeCloseTo(initialX, 0);
  await expect(
    carousel.getByRole("button", { name: "上一個專案" }),
  ).toBeEnabled();
});

test("JavaScript 失效時仍可瀏覽全部專案摘要與 GitHub 連結", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/projects/?no-script");

  const carousel = page.getByRole("region", { name: "展示專案輪播" });
  await expect(carousel.getByRole("article")).toHaveCount(4);
  const links = carousel.getByRole("link", { name: /前往 GitHub/ });
  await expect(links).toHaveCount(4);
  for (let index = 0; index < (await links.count()); index += 1) {
    await expect(links.nth(index)).toHaveAttribute("target", "_blank");
  }

  await context.close();
});
