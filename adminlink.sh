#!/bin/sh
# Fresh admin sign-in link. Email is not configured yet, so the link is
# written to the dev server log rather than sent; this pulls out the
# newest one.
#
# Two URLs because SITE_URL is localhost: that only works in a browser
# on this machine. On a phone or another laptop, localhost is that
# device — use the network one.
cd "$(dirname "$0")" 2>/dev/null || exit 1

ADMIN=$(grep '^ADMIN_EMAIL=' .dev.vars | cut -d= -f2-)
curl -s -X POST http://localhost:4321/api/auth/request \
  -H 'content-type: application/json' -H 'origin: http://localhost:4321' \
  --data "{\"email\":\"$ADMIN\"}" > /dev/null
sleep 2

LINK=$(npx astro dev logs 2>&1 | grep -o 'Magic link: [^"\\]*' | tail -1 | sed 's/Magic link: //')
[ -z "$LINK" ] && { echo "No link found — is the dev server running? (npx astro dev --background --host)"; exit 1; }

LAN=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

echo "Valid 15 minutes, single use."
echo
echo "  this machine:  $LINK"
[ -n "$LAN" ] && echo "  phone / LAN:   $(echo "$LINK" | sed "s|localhost|$LAN|")"
