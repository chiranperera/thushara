/**
 * The three legal pages — privacy, terms, disclaimer — as text he edits
 * himself under Legal pages in the admin.
 *
 * They are his own policies, not ours, so the wording lives in the
 * settings table rather than in code. Migration 0006 seeds the first
 * version; from then on only the admin changes it.
 *
 * Formatting is deliberately tiny, so it can be typed without knowing
 * any code:
 *   blank line   → new paragraph
 *   "## Heading" → section heading
 *   "- item"     → bullet point
 * Everything is HTML-escaped. Nothing he types can inject markup.
 */

export const LEGAL_PAGES = {
  privacy: { key: "legal_privacy", label: "Privacy policy" },
  terms: { key: "legal_terms", label: "Terms of use" },
  disclaimer: { key: "legal_disclaimer", label: "Insurance disclaimer" },
} as const;

export type LegalPage = keyof typeof LEGAL_PAGES;

/** Long enough for any real policy; short enough to stop a runaway paste. */
export const LEGAL_MAX = 50_000;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Turn his plain text into safe HTML. */
export function renderLegal(text: string): string {
  const out: string[] = [];
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => { if (para.length) out.push(`<p>${para.join(" ")}</p>`); para = []; };
    const flushList = () => { if (list.length) out.push(`<ul>${list.map((li) => `<li>${li}</li>`).join("")}</ul>`); list = []; };

    for (const line of lines) {
      if (line.startsWith("## ")) {
        flushPara(); flushList();
        out.push(`<h2>${esc(line.slice(3).trim())}</h2>`);
      } else if (line.startsWith("- ")) {
        flushPara();
        list.push(esc(line.slice(2).trim()));
      } else {
        flushList();
        para.push(esc(line));
      }
    }
    flushPara(); flushList();
  }
  return out.join("\n");
}

/** The saved text and when it last changed, or null if never saved. */
export async function getLegal(db: any, page: LegalPage): Promise<{ text: string; updatedAt: string | null } | null> {
  if (!db) return null;
  try {
    const r = await db
      .prepare(`SELECT value, updated_at FROM settings WHERE key = ?`)
      .bind(LEGAL_PAGES[page].key)
      .first<{ value: string; updated_at: string | null }>();
    const text = (r?.value ?? "").trim();
    return text && text !== "PENDING" ? { text, updatedAt: r?.updated_at ?? null } : null;
  } catch (e) {
    console.error("[legal] read failed", e);
    return null;
  }
}
