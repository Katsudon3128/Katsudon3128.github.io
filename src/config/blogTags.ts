export const blogTags = [
  { label: "產品開發", slug: "product-development" },
  { label: "軟體設計", slug: "software-design" },
  { label: "發布流程", slug: "publishing-workflow" },
] as const;

export function getBlogTag(label: string) {
  return blogTags.find((tag) => tag.label === label);
}
