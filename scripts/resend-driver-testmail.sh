#!/usr/bin/env bash
# Sendet die fixe Vorlage `fahrerinformationen_v1` als einzelne Testmail
# an info@kraftfahrer-mieten.com. Keine Massenmail, keine DB-Änderung,
# keine Logikänderung. Reine Wiederhol-Aktion des bisherigen Testversands.
#
# Voraussetzungen (Env):
#   SUPABASE_URL                 z.B. https://hxnabnsoffzevqhruvar.supabase.co
#   NEWSLETTER_INTERNAL_SECRET   Wert des Edge-Function-Secrets `x-newsletter-secret`
#
# Optional:
#   TEST_EMAIL  (Default: info@kraftfahrer-mieten.com)

set -euo pipefail

: "${SUPABASE_URL:?SUPABASE_URL fehlt}"
: "${NEWSLETTER_INTERNAL_SECRET:?NEWSLETTER_INTERNAL_SECRET fehlt}"
TEST_EMAIL="${TEST_EMAIL:-info@kraftfahrer-mieten.com}"

echo "Sende Testmail (fahrerinformationen_v1) an ${TEST_EMAIL} ..."

curl -sS -X POST \
  "${SUPABASE_URL}/functions/v1/send-driver-newsletter" \
  -H "Content-Type: application/json" \
  -H "x-newsletter-secret: ${NEWSLETTER_INTERNAL_SECRET}" \
  -d "{\"templateId\":\"fahrerinformationen_v1\",\"testEmail\":\"${TEST_EMAIL}\"}"

echo