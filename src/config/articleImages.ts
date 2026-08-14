import productFlow from "../assets/articles/product-flow.svg";

export const articleImages = {
  "product-flow": {
    source: productFlow,
    widths: [480, 800, 1200],
  },
} as const;

export type ArticleImageKey = keyof typeof articleImages;

export const articleImageKeys = Object.keys(articleImages) as [
  keyof typeof articleImages,
  ...(keyof typeof articleImages)[],
];

export function getArticleImage(key: ArticleImageKey) {
  return articleImages[key];
}
