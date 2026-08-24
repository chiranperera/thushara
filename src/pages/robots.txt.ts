import type { APIRoute } from "astro";
import { site } from "../lib/site";

export const prerender = false;

export const GET: APIRoute = async ({ site: astroSite }) => {
  const base = (astroSite ?? new URL(site.url)).toString().replace(/\/$/, "");
  return new Response(
    `User-agent: *
Allow: /

# Nothing useful to a crawler, and /admin must never be indexed.
Disallow: /admin
Disallow: /api/
Disallow: /book
Disallow: /testimonials/share

Sitemap: ${base}/sitemap.xml
`,
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
};
