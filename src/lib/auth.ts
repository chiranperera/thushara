/**
 * Admin authentication — single user, magic link.
 *
 * No roles, no permissions matrix, no team management. Thushara is the
 * only person who will ever sign in, and a password is one more thing
 * to forget. Spec: design-brief/09-admin-panel-spec.md
 *
 * Sessions are stateless: an HMAC-signed cookie, verified with Web
 * Crypto (available in the Workers runtime).
 */

const SESSION_COOKIE = "tr_session";
const SESSION_DAYS = 30;
const TOKEN_MINUTES = 15;

const enc = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

async function sign(payload: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await key(secret), enc.encode(payload));
  return `${payload}.${b64url(sig)}`;
}

async function verify(signed: string, secret: string): Promise<string | null> {
  const i = signed.lastIndexOf(".");
  if (i < 1) return null;
  const payload = signed.slice(0, i);
  const expected = await sign(payload, secret);
  // Length-safe comparison; these are short fixed-shape strings.
  if (expected.length !== signed.length) return null;
  let diff = 0;
  for (let n = 0; n < expected.length; n++) diff |= expected.charCodeAt(n) ^ signed.charCodeAt(n);
  return diff === 0 ? payload : null;
}

/* ---------------------------------------------------------------- session */

export async function createSession(email: string, secret: string): Promise<string> {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return sign(`${email}|${expires}`, secret);
}

export async function readSession(cookieHeader: string | null, secret: string): Promise<string | null> {
  if (!cookieHeader || !secret) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;

  const payload = await verify(decodeURIComponent(match[1]), secret);
  if (!payload) return null;

  const [email, expires] = payload.split("|");
  if (!email || Number(expires) < Date.now()) return null;
  return email;
}

export function sessionCookie(value: string, secure: boolean): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearCookie(secure: boolean): string {
  return [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0", secure ? "Secure" : ""]
    .filter(Boolean)
    .join("; ");
}

/* ------------------------------------------------------------ magic link */

export function newToken(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
}

export function tokenExpiry(): string {
  return new Date(Date.now() + TOKEN_MINUTES * 60 * 1000).toISOString();
}

export interface AuthToken {
  token: string;
  email: string;
  expires_at: string;
  used_at: string | null;
}

/** Single-use, time-limited. Marks the token used on success. */
export async function consumeToken(db: any, token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const row: AuthToken | null = await db
      .prepare(`SELECT token, email, expires_at, used_at FROM auth_tokens WHERE token = ?`)
      .bind(token)
      .first();

    if (!row || row.used_at) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) return null;

    await db
      .prepare(`UPDATE auth_tokens SET used_at = ? WHERE token = ?`)
      .bind(new Date().toISOString(), token)
      .run();

    return row.email;
  } catch {
    return null;
  }
}

/** Housekeeping — expired tokens are not worth keeping. */
export async function pruneTokens(db: any): Promise<void> {
  try {
    await db.prepare(`DELETE FROM auth_tokens WHERE expires_at < ?`).bind(new Date().toISOString()).run();
  } catch {
    /* non-critical */
  }
}

/**
 * Guard for admin pages. Returns the signed-in email, or null.
 * Pages redirect to /admin/login when this is null.
 */
export async function requireAdmin(request: Request, secret: string): Promise<string | null> {
  return readSession(request.headers.get("cookie"), secret);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const MAGIC_LINK_MINUTES = TOKEN_MINUTES;
