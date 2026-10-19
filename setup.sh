#!/bin/sh
# setup.sh — auto-run admin bootstrap for headless deployment
#
# After the new-api container starts, this script POSTs to /api/setup so
# the admin account is created without anyone needing to click through
# the wizard. It is idempotent: if setup has already run it exits cleanly.
#
# Required environment variables:
#   ADMIN_USERNAME       — root username (1–12 chars, per wizard schema)
#   ADMIN_PASSWORD       — root password (8–128 chars)
#
# Optional:
#   SETUP_BASE_URL       — base URL to POST to (default: http://127.0.0.1:3000)
#   SETUP_MODE           — self | demo | external (default: self)
#   SETUP_TIMEOUT        — seconds to wait for backend (default: 120)
#   SETUP_SKIP           — set to "1" to skip bootstrap entirely
#
# Exit codes:
#   0 — setup already done OR bootstrap succeeded
#   1 — timeout waiting for backend
#   2 — /api/setup POST returned a non-success body
#   3 — missing required env vars
#
# This file is AGPLv3-licensed; see /LICENSE.

set -e

if [ "${SETUP_SKIP:-0}" = "1" ]; then
  echo "[setup] SETUP_SKIP=1 — skipping bootstrap"
  exit 0
fi

if [ -z "${ADMIN_USERNAME:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "[setup] ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set" >&2
  exit 3
fi

BASE_URL="${SETUP_BASE_URL:-http://127.0.0.1:3000}"
MODE="${SETUP_MODE:-self}"
TIMEOUT="${SETUP_TIMEOUT:-120}"
HEALTH_URL="${BASE_URL%/}/api/status"
SETUP_URL="${BASE_URL%/}/api/setup"

echo "[setup] Waiting for backend at ${HEALTH_URL} (timeout ${TIMEOUT}s)"

elapsed=0
while [ "$elapsed" -lt "$TIMEOUT" ]; do
  if wget -q -O - --timeout=2 "${HEALTH_URL}" 2>/dev/null | grep -q '"success":\s*true'; then
    echo "[setup] Backend healthy"
    break
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

if [ "$elapsed" -ge "$TIMEOUT" ]; then
  echo "[setup] ERROR: backend did not become healthy within ${TIMEOUT}s" >&2
  exit 1
fi

echo "[setup] Checking setup status"
STATUS_BODY=$(wget -q -O - --timeout=5 "${SETUP_URL}" 2>/dev/null || echo "")

if echo "${STATUS_BODY}" | grep -q '"initialized":\s*true'; then
  echo "[setup] Already initialized — nothing to do"
  exit 0
fi

if echo "${STATUS_BODY}" | grep -q '"root_user_exists":\s*true'; then
  echo "[setup] Root user already exists — nothing to do"
  exit 0
fi

echo "[setup] Posting /api/setup with username='${ADMIN_USERNAME}', mode='${MODE}'"

# new-api's PostSetup expects a JSON body with the lowercase field names
# defined in controller.SetupRequest:
#   username, password, confirmPassword, SelfUseModeEnabled, DemoSiteEnabled
# We construct it via printf to avoid depending on a specific JSON tool.
PAYLOAD=$(printf '{"username":"%s","password":"%s","confirmPassword":"%s","SelfUseModeEnabled":%s,"DemoSiteEnabled":%s}' \
  "${ADMIN_USERNAME}" \
  "${ADMIN_PASSWORD}" \
  "${ADMIN_PASSWORD}" \
  "$([ "${MODE}" = "self" ] && echo true || echo false)" \
  "$([ "${MODE}" = "demo" ] && echo true || echo false)" \
)

# Pin body to a temp file so wget doesn't mangle quoting.
BODY_FILE=$(mktemp)
trap 'rm -f "${BODY_FILE}"' EXIT
printf '%s' "${PAYLOAD}" > "${BODY_FILE}"

RESP=$(wget -q -O - --timeout=10 \
  --header='Content-Type: application/json' \
  --body-file="${BODY_FILE}" \
  --server-response \
  "${SETUP_URL}" 2>&1 || true)

if echo "${RESP}" | grep -q '"success":\s*true'; then
  echo "[setup] Bootstrap OK — admin '${ADMIN_USERNAME}' created"
  exit 0
fi

echo "[setup] ERROR: /api/setup did not return success" >&2
echo "${RESP}" >&2
exit 2
