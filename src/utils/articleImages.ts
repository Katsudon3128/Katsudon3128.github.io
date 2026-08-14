import { getImage } from "astro:assets";
import {
  articleImages,
  getArticleImage,
  type ArticleImageKey,
} from "../config/articleImages";

export type ResponsiveArticleImage = {
  key: ArticleImageKey;
  src: string;
  srcset: string;
  width: number;
  height: number;
  sizes: string;
};

export async function buildResponsiveArticleImage(
  key: ArticleImageKey,
  sizes: string,
): Promise<ResponsiveArticleImage> {
  const image = getArticleImage(key);
  const output = await getImage({
    src: image.source,
    widths: [...image.widths],
    sizes,
    format: "webp",
    quality: "high",
  });

  return {
    key,
    src: output.src,
    srcset: output.srcSet.attribute,
    width: image.source.width,
    height: image.source.height,
    sizes,
  };
}

export async function buildResponsiveArticleImages(sizes: string) {
  return Promise.all(
    (Object.keys(articleImages) as ArticleImageKey[]).map((key) =>
      buildResponsiveArticleImage(key, sizes),
    ),
  );
}

export function enhanceArticleImages(
  html: string,
  images: ResponsiveArticleImage[],
) {
  return images.reduce(
    (result, image) =>
      result.replace(
        new RegExp(
          `<img([^>]*)\\bsrc=["']article:${escapeRegExp(image.key)}["']([^>]*)>`,
          "g",
        ),
        `<img$1src="${image.src}"$2 width="${image.width}" height="${image.height}" loading="lazy" decoding="async" srcset="${image.srcset}" sizes="${image.sizes}">`,
      ),
    html,
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
