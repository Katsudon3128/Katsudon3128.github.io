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
- 文章圖片鍵、來源與響應式寬度：`src/config/articleImages.ts`
- 本機素材：`public/assets/`

### 發布文章

- `slug` 必須手動填寫 ASCII kebab-case；文章從草稿改為發布後不得變更。
- `draft: true` 的文章可用 `npm run dev` 預覽，但不會進入正式建置輸出。
- `showLineNumbers: true` 可為個別文章的程式碼區塊顯示行號；預設為關閉。
- 封面使用 `articleImages` 的圖片鍵；Markdown 正文圖片使用 `![替代文字](article:<圖片鍵>)`。
- 新增或替換文章圖片時，只需更新 `src/config/articleImages.ts` 的來源與響應式寬度。

## 授權

原始碼採用 [MIT License](LICENSE)。網站文章、圖片與其他內容保留所有權利。
