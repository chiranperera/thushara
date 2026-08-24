# Thushara Rathnayake — personal brand website

Personal-brand site for a Senior Financial Consultant in Sri Lanka.
Built against the approved design in `../design-brief/`.

**The site's primary job is not to be found on Google. It is to be sent
over WhatsApp.** Every technical decision follows from that: mobile
first, fast on Sri Lankan mobile data, every page standing alone, and a
per-page preview card because the WhatsApp card is often seen before the
page loads.

---

## Stack

| | |
| --- | --- |
| Framework | Astro 5, SSR |
| Interactive | Preact (compat) islands — booking form, carousel, milestone line, life-stage selector |
| Styling | Tailwind CSS v4, tokens in `src/styles/global.css` |
| Host / runtime | Cloudflare Pages + Workers |
| Database | Cloudflare D1 (SQLite) |
| Files | Cloudflare R2 |
| Email | Resend |
| Cost | ~$5/month + domain (~$72/year) |

Preact rather than React: only five hooks are used across the site, and
it saves ~40 KB gzipped. On mobile data that is a real difference.

---

## Local development

```bash
npm install
npx wrangler d1 migrations apply thushara-db --local
cp .dev.vars.example .dev.vars      # then fill it in
npm run dev
```

`.dev.vars` needs at minimum `AUTH_SECRET` and `ADMIN_EMAIL` for admin
sign-in. Without `RESEND_API_KEY`, magic links and notifications are
logged to the console instead of sent — leads still save.

### One gotcha worth knowing

**Astro dev + Tailwind v4 does not reliably pick up newly created files,
or edits to component files, without a dev-server restart.** Symptoms are
utilities silently missing from the compiled CSS, or a stale scoped
stylesheet. If something looks unstyled, restart before debugging the
code. Running `npm run build` while the dev server is up also invalidates
its dependency cache and will 500 the site until you restart.

---

## Deployment

1. Register a domain and point its nameservers at Cloudflare
2. Enable **Workers Paid** ($5/month)
3. `npx wrangler d1 create thushara-db` — paste the id into `wrangler.jsonc`
4. `npx wrangler r2 bucket create thushara-media`
5. `npx wrangler d1 migrations apply thushara-db --remote`
6. Connect the repo to Cloudflare Pages
7. Verify the sending domain in Resend (SPF + DKIM)
8. Set secrets: `npx wrangler secret put RESEND_API_KEY` and `AUTH_SECRET`
9. Set vars in `wrangler.jsonc`: `SITE_URL`, `ADMIN_EMAIL`, `FROM_EMAIL`
10. Update `site:` in `astro.config.mjs` to the real domain

---

## The rule that matters

**`POST /api/lead` writes to the database BEFORE attempting any
notification, and flags `notification_failed` if email fails.** A bad
minute at the email provider must never cost a lead. This is verified —
with Resend unconfigured, a submitted lead still persists and shows a
warning in `/admin`.

Don't reorder that.

---

## Admin

`/admin` — single user, magic-link sign-in, no password.

Enquiries · Reviews · Photos · Guides · Questions · Service pages ·
When I'm available · My details.

Deliberately absent: blog editor, page builder, theme settings,
analytics, user management, plugins. Each would add power he does not
need and complexity he cannot afford.

**Reviews are never auto-published.** The client asked for automatic
publishing; a public unmoderated form on a regulated professional's site
invites spam, abuse and misleading claims about policies. Submissions
land pending and he gets a one-tap approve link by email. Raise this with
him if he pushes back — it is a recommendation, not a decision made for
him.

`years_experience` and `mdrt_years` live in the `settings` table and
appear on every page. He updates them himself each year. **Never
hard-code them.**

---

## Still pending — see `../design-brief/11-open-questions.md`

Blocking before launch:

- **Does SLIC restrict how its consultants market themselves?** Could
  affect every page's footer.
- **IRCSL regulatory wording** — registration number, required
  disclaimers. The legal pages are drafted but marked for review.
- **Real contact details** — phone, WhatsApp, email. Currently `PENDING`,
  which the site renders as hidden rather than blank.
- **Domain.**

Content still needed from Thushara:

- Photography (shot list in `design-brief/03`)
- 21 of 29 FAQ answers, marked `PENDING` in `src/lib/faq-content.ts`
  rather than guessed
- Cover-level table figures (`figure pending`)
- The four PDF guides
- Confirmation of his real career dates on `/about`
- Testimonials — two seeded for testing, should be cleared before launch

Nothing on the site invents a fact he has not supplied.

---

## Measured

| | |
| --- | --- |
| Homepage | 234 KB total, mobile |
| Service page | 83 KB |
| /book | 108 KB |
| JS + CSS | 52 KB gzipped, whole site |
| Budget | 800 KB |

Fonts are self-hosted (not CDN) — same-origin is measurably faster on Sri
Lankan mobile data. Icons went 1.3 MB → 64 KB; the hero portrait
1.43 MB → 80 KB on mobile.
