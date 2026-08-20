function languageLabel(attributes: string) {
  return attributes.match(/\bdata-language=["']([^"']+)["']/)?.[1] ?? "純文字";
}

function addLineNumberData(pre: string) {
  let lineNumber = 0;

  return pre.replace(/<span class="line">/g, () => {
    lineNumber += 1;
    return `<span class="line" data-line-number="${lineNumber}">`;
  });
}

export function enhanceCodeBlocks(html: string) {
  let blockIndex = 0;

  return html.replace(
    /<pre\b([^>]*)>([\s\S]*?)<\/pre>/g,
    (pre, attributes: string) => {
      blockIndex += 1;
      const statusId = `code-copy-status-${blockIndex}`;

      return `<div class="code-block" data-code-block>
  <div class="code-block__toolbar">
    <span>${languageLabel(attributes)}</span>
    <button type="button" data-copy-code aria-describedby="${statusId}" hidden>複製程式碼</button>
    <span id="${statusId}" class="visually-hidden" role="status" aria-live="polite"></span>
  </div>
  ${addLineNumberData(pre)}
</div>`;
    },
  );
}
