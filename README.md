# 查理林個人能力展示網站

使用 Astro、TypeScript、Markdown 與原生 CSS 建置的純靜態網站，正式網址為 <https://katsudon3128.github.io/>。

## 本機開發

需要 Node.js 22 以上版本。

```sh
npm install
npm run dev
```

提交前可執行完整驗證：

```sh
npm run verify
```

## 替換內容

- 網站名稱、網址、聯絡方式、頁面 metadata 與主要素材：`src/config/site.ts`
- 展示專案：`src/data/projects.ts`
- 想法：`src/data/thoughts.ts`
- Markdown 文章：`src/data/blog/`
- 本機素材：`public/assets/`

## 授權

原始碼採用 [MIT License](LICENSE)。網站文章、圖片與其他內容保留所有權利。
