/** A page of unpaginated text is 40 lines, numbered from 1. HTML and markdown use this. */
export const LINES_PER_PAGE = 40;
export const MAX_READ_PAGES = 20;
export const GREP_TOKEN_BUDGET = 1500;

export type Page = { number: number; text: string };

/** Lines prefixed with their 1-based number, so a model can cite by line instead of copying text. */
export function numberLines(text: string, firstLine = 1): string {
  return text.split("\n").map((line, i) => `${firstLine + i}| ${line}`).join("\n");
}

export function paginate(text: string): Page[] {
  const lines = text.split("\n");
  if (lines.length === 0) return [{ number: 1, text: "" }];
  const pages: Page[] = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push({ number: pages.length + 1, text: lines.slice(i, i + LINES_PER_PAGE).join("\n") });
  }
  return pages;
}

export function pageOfLine(lineIndex: number): number {
  return Math.floor(lineIndex / LINES_PER_PAGE) + 1;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
