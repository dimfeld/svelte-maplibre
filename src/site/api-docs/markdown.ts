// A very small Markdown renderer for doc comments. Doc comments use only a few Markdown
// features, so this handles paragraphs, lists, code fences, inline code, bold, and links.

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderInline(text: string) {
  // Split out inline code first so that its contents are not formatted.
  return text
    .split(/(`[^`]+`)/)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      }

      return escapeHtml(part)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/(^|[\s(])(https?:\/\/[^\s)<]+[^\s)<.,])/g, '$1<a href="$2">$2</a>');
    })
    .join('');
}

export function renderMarkdown(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  const output: string[] = [];

  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      output.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
    if (list.length) {
      output.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
      list = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i]);
        i++;
      }
      output.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
    } else if (!trimmed) {
      flush();
    } else if (/^[-*] /.test(trimmed)) {
      if (paragraph.length) {
        flush();
      }
      list.push(trimmed.slice(2));
    } else if (list.length && /^\s+/.test(line)) {
      // Continuation of a list item
      list[list.length - 1] += ' ' + trimmed;
    } else {
      if (list.length) {
        flush();
      }
      paragraph.push(trimmed);
    }
  }

  flush();
  return output.join('\n');
}

/** Get the first paragraph of the text as plain text, for use in summaries. */
export function summarize(text: string): string {
  const first = text.trim().split(/\n\s*\n/)[0] ?? '';
  return first.replace(/\s+/g, ' ').replace(/`/g, '').trim();
}
