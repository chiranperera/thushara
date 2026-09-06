#!/bin/sh
# Fresh admin sign-in link for the LIVE site.
#
# RESEND_API_KEY is not set yet, so the Worker logs the link instead of
# emailing it. This asks for one and reads it back out of the live log
# stream. Delete this script the day Resend is connected — at that
# point Thushara just types his address on /admin/login and the link
# arrives in his inbox, which is the whole point of the design.
cd "$(dirname "$0")" 2>/dev/null || exit 1
U=https://thushara-rathnayake.thusharaslic.workers.dev

rm -f /tmp/adminlink-tail.log
nohup npx wrangler tail thushara-rathnayake --format json > /tmp/adminlink-tail.log 2>&1 &
sleep 9   # tail takes a few seconds to attach; firing early misses the log line
curl -s -X POST "$U/api/auth/request" \
  -H 'content-type: application/json' -H "origin: $U" \
  --data '{"email":"thusharaslic@gmail.com"}' > /dev/null
sleep 11
pkill -f 'wrangler tail' 2>/dev/null

LINK=$(grep -o 'Magic link: [^"\\]*' /tmp/adminlink-tail.log | tail -1 | sed 's/Magic link: //')
[ -z "$LINK" ] && { echo "No link captured. Try again — the log stream can miss the first request."; exit 1; }
echo "Valid 15 minutes, single use."
echo
echo "  $LINK"
