/**
 * GET /admin/auth?token=… — consume the magic link and start a session.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { consumeToken, createSession, sessionCookie } from "../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  const bindings = env as unknown as Record<string, any>;
  const db = bindings.DB;
  const secret = bindings.AUTH_SECRET;

  const fail = (reason: string) =>
    new Response(null, { status: 302, headers: { location: `/admin/login?e=${reason}` } });

  if (!db || !secret) return fail("config");

  const email = await consumeToken(db, url.searchParams.get("token") ?? "");
  if (!email) return fail("expired");

  try {
    await db
      .prepare(
        `INSERT INTO admin_users (email, created_at, last_login_at) VALUES (?,?,?)
         ON CONFLICT(email) DO UPDATE SET last_login_at = excluded.last_login_at`,
      )
      .bind(email, new Date().toISOString(), new Date().toISOString())
      .run();
  } catch (err) {
    console.error("[auth] could not record login", err);
  }

  const session = await createSession(email, secret);
  return new Response(null, {
    status: 302,
    headers: {
      location: "/admin",
      "set-cookie": sessionCookie(session, url.protocol === "https:"),
    },
  });
};
