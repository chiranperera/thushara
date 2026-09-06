/**
 * robots.txt, decided by the hostname it is served from.
 *
 * The site goes live on a workers.dev address before the real domain
 * is connected, and that address is public the moment it deploys.
 * Google will find and index it — and an unfinished site carrying
 * Thushara's real name and phone number, ranking under a URL that is
 * not his, is a worse outcome than not being indexed at all. Worse
 * still, it competes with the real domain later.
 *
 * A hand-written `Disallow: /` would fix that and then be forgotten on
 * launch day, which is the failure this file exists to prevent. So the
 * rule is derived rather than remembered: any host that is not the
 * real domain refuses all crawling, and the real domain allows it. The
 * switch happens by connecting the domain, with nothing to edit.
 */
import type { APIRoute } from "astro";

const BLOCK = `User-agent: *
Disallow: /
`;

export const prerender = false;

export const GET: APIRoute = ({ url, site }) => {
  const host = url.hostname;

  // The canonical host from astro.config. Until the domain is
  // registered that is still example.com, which no deployment will
  // ever match — so every environment blocks until it is set. That is
  // the right way round: forgetting to update it costs us traffic we
  // do not want yet, rather than leaking a half-finished site.
  const canonical = site?.hostname;
  const isLive = Boolean(canonical) && host === canonical;

  const body = isLive
    ? `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${new URL("/sitemap-index.xml", site).href}
`
    : BLOCK;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Short cache: this response changes the day the domain is
      // connected, and a crawler holding a stale "Disallow: /" for a
      // week would delay indexing the real site.
      "cache-control": "public, max-age=300",
    },
  });
};
