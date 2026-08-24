/**
 * POST /api/auth/request — send a magic link.
 *
 * Always reports success, whatever the email address. An admin login
 * form that says "no such user" tells an attacker which address is the
 * real one.
 */

import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resend } from "resend";
import { newToken, tokenExpiry, pruneTokens, MAGIC_LINK_MINUTES } from "../../../lib/auth";
import { site } from "../../../lib/site";

export const prerender = false;

const attempts = new Map<string, number[]>();
const RATE = { max: 5, windowMs: 15 * 60 * 1000 };

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const bindings = env as unknown as Record<string, any>;
  const db = bindings.DB;

  // Rate limit before anything else — this endpoint sends email.
  const ip = clientAddress ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  recent.push(now);
  attempts.set(ip, recent);
  if (recent.length > RATE.max) {
    return json({ ok: false, message: "Too many attempts. Please wait a few minutes." }, 429);
  }

  let email = "";
  try {
    email = String((await request.json<any>())?.email ?? "").trim().toLowerCase();
  } catch {
    return json({ ok: true }); // don't leak parse failures either
  }

  const adminEmail = String(bindings.ADMIN_EMAIL ?? "").trim().toLowerCase();

  // Only the configured admin address is ever issued a link.
  if (!db || !email || !adminEmail || adminEmail === "pending" || email !== adminEmail) {
    return json({ ok: true });
  }

  await pruneTokens(db);

  const token = newToken();
  try {
    await db
      .prepare(`INSERT INTO auth_tokens (token, email, purpose, expires_at, created_at) VALUES (?,?,?,?,?)`)
      .bind(token, email, "login", tokenExpiry(), new Date().toISOString())
      .run();
  } catch (err) {
    console.error("[auth] could not store token", err);
    return json({ ok: true });
  }

  const base = bindings.SITE_URL ?? site.url;
  const link = `${base}/admin/auth?token=${encodeURIComponent(token)}`;

  const apiKey = bindings.RESEND_API_KEY;
  const from = bindings.FROM_EMAIL;

  if (!apiKey || !from || from === "PENDING") {
    // Email is not configured yet. Log the link so the build can be
    // exercised locally — never returned in the response body.
    console.warn(`[auth] email not configured. Magic link: ${link}`);
    return json({ ok: true });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: email,
      subject: "Sign in to your website",
      html: `<!doctype html><html><body style="margin:0;background:#F4F1E9;padding:24px 12px">
<table role="presentation" width="100%"><tr><td align="center">
<table role="presentation" style="max-width:480px;background:#FBFAF6;border:1px solid #DCDFDC;border-radius:16px">
<tr><td style="background:#06231F;padding:20px 28px">
  <div style="font:700 12px/1.4 -apple-system,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#C9962F">Sign in</div>
</td></tr>
<tr><td style="padding:28px">
  <p style="margin:0 0 20px;font:400 18px/1.6 -apple-system,sans-serif;color:#161A19">
    Tap the button below to sign in to your website. It works once, and expires in ${MAGIC_LINK_MINUTES} minutes.
  </p>
  <a href="${link}" style="display:block;text-align:center;padding:16px;background:#12544A;color:#FBFAF6;text-decoration:none;border-radius:999px;font:700 17px/1 -apple-system,sans-serif">Sign in</a>
  <p style="margin:20px 0 0;font:400 15px/1.5 -apple-system,sans-serif;color:#737C79">
    If you didn't ask for this, you can ignore it — nothing will happen.
  </p>
</td></tr></table></td></tr></table></body></html>`,
    });
  } catch (err) {
    console.error("[auth] send failed", err);
  }

  return json({ ok: true });
};
