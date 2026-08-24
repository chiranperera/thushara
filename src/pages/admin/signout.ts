import type { APIRoute } from "astro";
import { clearCookie } from "../../lib/auth";

export const prerender = false;

export const GET: APIRoute = async ({ url }) =>
  new Response(null, {
    status: 302,
    headers: { location: "/admin/login", "set-cookie": clearCookie(url.protocol === "https:") },
  });
