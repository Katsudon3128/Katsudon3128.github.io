export interface ArticleHeading {
  depth: 2 | 3;
  slug: string;
  text: string;
}

function isArticleHeading(value: unknown): value is ArticleHeading {
  if (!value || typeof value !== "object") return false;

  const heading = value as Record<string, unknown>;
  return (
    (heading.depth === 2 || heading.depth === 3) &&
    typeof heading.slug === "string" &&
    typeof heading.text === "string"
  );
}

export function getArticleHeadings(value: unknown) {
  return Array.isArray(value) ? value.filter(isArticleHeading) : [];
}
