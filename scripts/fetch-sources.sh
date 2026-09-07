#!/usr/bin/env bash
# Downloads the primary hadith collections used for verification.
# Source: fawazahmed0/hadith-api (mirrors Sunnah.com text + scholar gradings).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p hadith && cd hadith
for ed in eng-bukhari eng-muslim eng-abudawud eng-tirmidhi eng-nasai eng-ibnmajah \
          ara-bukhari ara-muslim ara-abudawud ara-tirmidhi ara-nasai ara-ibnmajah; do
  echo "→ $ed"
  curl -sfL --max-time 120 -o "$ed.json" \
    "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/$ed.min.json"
done
echo "✅ sources ready"
