const HTML_ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  nbsp: " ",
  middot: "·",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

const MAX_DECODE_ITERATIONS = 5;

function decodeCodePoint(match: string, codePoint: number) {
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return match;
  }
}

function decodeHtmlEntitiesOnce(value: string): string {
  return value
    .replace(/&#(\d+);/g, (match, code: string) =>
      decodeCodePoint(match, Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (match, code: string) =>
      decodeCodePoint(match, parseInt(code, 16)),
    )
    .replace(/&([a-zA-Z]+|#39);/g, (match, entity: string) =>
      HTML_ENTITY_MAP[entity] ?? match,
    );
}

export function decodeHtmlEntities(value: string): string {
  let decoded = value;

  for (let i = 0; i < MAX_DECODE_ITERATIONS; i += 1) {
    const next = decodeHtmlEntitiesOnce(decoded);
    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
}

export function formatEventTitle(title: string): string {
  return decodeHtmlEntities(title);
}
