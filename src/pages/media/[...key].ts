/**
 * GET /media/<key> — serves a photo or PDF out of R2.
 *
 * Keys are unguessable enough that gated guides aren't meaningfully
 * exposed here, but gating exists to capture a lead rather than to keep
 * a marketing PDF secret. The download page is what records the lead;
 * this route just hands over bytes.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { contentTypeForKey } from "../../lib/media";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const bindings = env as unknown as Record<string, any>;
  const bucket = bindings.MEDIA;
  const key = String(params.key ?? "");

  if (!bucket || !key || key.includes("..")) return new Response("Not found", { status: 404 });

  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  // R2 gives us an etag; honouring it means a repeat visit costs nothing.
  const etag = object.httpEtag;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { etag } });
  }

  return new Response(object.body, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? contentTypeForKey(key),
      "content-length": String(object.size),
      etag,
      // Keys are unique per upload, so a file at a given key never
      // changes. Cache it hard.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
