#!/bin/sh
# entrypoint.sh — Docker / PaaS entrypoint wrapper
#
# Runs setup.sh in the background to bootstrap the admin account via
# /api/setup (idempotent — no-op if already initialized), then exec's
# the new-api binary in the foreground so it becomes PID 1 and receives
# signals from the platform.

set -e

# Background bootstrap. Logs stream to stdout alongside the app because
# we don't redirect to a file — platforms like Railway/Render surface
# stdout to the user. Failures are logged by setup.sh itself.
sh /setup.sh &

exec /new-api
