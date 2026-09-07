#!/bin/bash
set -e
# Canonical test entry point: `npm test` or `bash scripts/test.sh [vitest args]`.
# Starts a wiped PocketBase test instance on :8092 via vitest global-setup,
# then runs the API integration suite. Extra args are forwarded to vitest, e.g.:
#   bash scripts/test.sh tests/api/kingdoms.test.ts

# Sandboxed shells may export *proxy vars with an empty no_proxy, which breaks
# the test harness's loopback health check against 127.0.0.1:8092.
# Neutralize them here so the same command works everywhere.
unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY NODE_USE_ENV_PROXY
export no_proxy="127.0.0.1,localhost"
export NO_PROXY="127.0.0.1,localhost"

npx vitest run --config vitest.config.ts "$@"
