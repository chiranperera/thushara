#!/bin/sh
# Generates a fresh admin sign-in link. Run from the website folder.
cd "$(dirname "$0")" 2>/dev/null
ADMIN=$(grep '^ADMIN_EMAIL=' .dev.vars | cut -d= -f2-)
curl -s -X POST http://localhost:4321/api/auth/request \
  -H 'content-type: application/json' -H 'origin: http://localhost:4321' \
  --data "{\"email\":\"$ADMIN\"}" > /dev/null
sleep 2
npx astro dev logs 2>&1 | grep -o 'Magic link: [^"\\]*' | tail -1 | sed 's/Magic link: //'
