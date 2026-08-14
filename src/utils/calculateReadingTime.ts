const WORDS_PER_MINUTE = 225;
const CJK_CHARACTERS_PER_MINUTE = 500;

export function calculateReadingMinutes(markdown: string) {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ");
  const cjkCharacters =
    prose.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu)
      ?.length ?? 0;
  const latinWords =
    prose
      .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu, " ")
      .match(/[\p{L}\p{N}]+(?:['’_-][\p{L}\p{N}]+)*/gu)?.length ?? 0;

  return Math.max(
    1,
    Math.ceil(
      cjkCharacters / CJK_CHARACTERS_PER_MINUTE + latinWords / WORDS_PER_MINUTE,
    ),
  );
}
