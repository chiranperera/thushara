import type { APIRoute } from "astro";
import { services, site } from "../lib/site";
import { personaSlugs } from "../lib/persona-content";

export const prerender = false;

/** Booking and legal pages are deliberately excluded from discovery. */
const pages: { path: string; priority: number; freq: string }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/about", priority: 0.9, freq: "monthly" },
  { path: "/services", priority: 0.9, freq: "monthly" },
  ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8, freq: "monthly" })),
  ...personaSlugs.map((p) => ({ path: `/for/${p}`, priority: 0.9, freq: "monthly" })),
  { path: "/process", priority: 0.7, freq: "monthly" },
  { path: "/testimonials", priority: 0.7, freq: "weekly" },
  { path: "/gallery", priority: 0.5, freq: "monthly" },
  { path: "/resources", priority: 0.7, freq: "monthly" },
  { path: "/faq", priority: 0.7, freq: "monthly" },
  { path: "/contact", priority: 0.8, freq: "monthly" },
];

export const GET: APIRoute = async ({ site: astroSite }) => {
  const base = (astroSite ?? new URL(site.url)).toString().replace(/\/$/, "");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url>
    <loc>${base}${p.path}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
  </url>`).join("\n")}
</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
};
