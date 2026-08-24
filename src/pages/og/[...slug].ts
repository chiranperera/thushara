/**
 * Dynamic Open Graph images.
 *
 * On this site the WhatsApp preview card IS the first impression —
 * often seen before the page itself loads. Generated as SVG: no canvas
 * dependency in the Worker, tiny, and instant.
 */
import type { APIRoute } from "astro";
import { site, getService } from "../../lib/site";
import { personas } from "../../lib/persona-content";

export const prerender = false;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Adequate wrap for a known font size and fixed width. */
function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max) { out.push(line.trim()); line = w; }
    else line += " " + w;
  }
  if (line.trim()) out.push(line.trim());
  return out.slice(0, 3);
}

function card(o: { eyebrow: string; title: string; years: number; mdrt: number }) {
  const lines = wrap(o.title, 26);
  const startY = Math.max(268, 330 - (lines.length - 1) * 34);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="bg" cx="5%" cy="12%" r="120%">
<stop offset="0%" stop-color="#0B3A33"/><stop offset="42%" stop-color="#062521"/><stop offset="100%" stop-color="#03130F"/>
</radialGradient></defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<g transform="translate(80,74)">
<rect x="0" y="10" width="44" height="3.5" rx="1.75" fill="#FBFAF6"/>
<rect x="20" y="10" width="3.5" height="34" rx="1.75" fill="#FBFAF6"/>
<circle cx="34" cy="9" r="7" fill="#C9962F"/>
</g>
<text x="146" y="96" font-family="Helvetica,Arial,sans-serif" font-size="25" font-weight="700" fill="#FBFAF6">${esc(site.name)}</text>
<text x="146" y="124" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="2.2" fill="#8CF7DE">${esc(site.title.toUpperCase())}</text>
<text x="80" y="176" font-family="Helvetica,Arial,sans-serif" font-size="18" font-weight="700" letter-spacing="2.6" fill="#E0B457">${esc(o.eyebrow.toUpperCase())}</text>
${lines.map((l, i) => `<text x="80" y="${startY + i * 68}" font-family="Helvetica,Arial,sans-serif" font-size="60" font-weight="700" fill="#FBFAF6">${esc(l)}</text>`).join("")}
<rect x="80" y="516" width="1040" height="1" fill="#FBFAF6" opacity="0.2"/>
<text x="80" y="562" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#FBFAF6">${o.years} years</text>
<circle cx="228" cy="555" r="4" fill="#C9962F"/>
<text x="248" y="562" font-family="Helvetica,Arial,sans-serif" font-size="22" font-weight="700" fill="#FBFAF6">${o.mdrt}\u00d7 MDRT Lifetime Member</text>
<circle cx="640" cy="555" r="4" fill="#C9962F"/>
<text x="660" y="562" font-family="Helvetica,Arial,sans-serif" font-size="22" fill="#FBFAF6" opacity="0.65">Sri Lanka</text>
</svg>`;
}

export const GET: APIRoute = async ({ params }) => {
  const slug = String(params.slug ?? "").replace(/\.svg$/, "");
  const years = site.credentials.yearsExperience;
  const mdrt = site.credentials.mdrtYears;

  let eyebrow = site.title;
  let title = "From your first car to your retirement.";

  const svc = getService(slug.replace(/^services\//, ""));
  const persona = personas[slug.replace(/^for\//, "")];

  if (svc) { eyebrow = "Insurance · Sri Lanka"; title = svc.title; }
  else if (persona) { eyebrow = persona.eyebrow; title = persona.title; }
  else if (slug === "about") { eyebrow = site.employer; title = site.name; }
  else if (slug === "book") { eyebrow = "Free · no obligation"; title = "Book a consultation"; }

  return new Response(card({ eyebrow, title, years, mdrt }), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
