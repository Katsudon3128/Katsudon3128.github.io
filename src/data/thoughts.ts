export type Thought = {
  text: string;
  publishedAt: string;
  related?: {
    label: string;
    href: string;
  };
};

export const thoughts: Thought[] = [
  {
    text: "先讓最小的端到端路徑成立，後續每個決定才有真實回饋可依據。",
    publishedAt: "2026-08-10",
    related: {
      label: "閱讀相關文章",
      href: "/blog/building-products-end-to-end/",
    },
  },
  {
    text: "清楚的限制往往比更多選項更能加快產品決策。",
    publishedAt: "2026-07-21",
  },
];
