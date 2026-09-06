#!/bin/bash
set -e

PB_VERSION="0.40.2"
PB_BIN="pb/pocketbase"

if [ -f "cmd/server/main.go" ]; then
  bash scripts/build-pb.sh
elif [ ! -f "$PB_BIN" ] || ! "$PB_BIN" --version 2>/dev/null | grep -q "$PB_VERSION"; then
  echo "→ Downloading PocketBase v$PB_VERSION..."
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/')
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
  mkdir -p pb
  curl -L "$URL" -o /tmp/pb.zip
  unzip -o /tmp/pb.zip -d pb pocketbase
  chmod +x "$PB_BIN"
  rm /tmp/pb.zip
  echo "✓ PocketBase v$PB_VERSION ready."
else
  echo "✓ PocketBase v$PB_VERSION already present."
fi

# Ensure directories exist (safe to run repeatedly)
mkdir -p pb/pb_hooks/routes pb/pb_hooks/utils pb/pb_migrations pb/pb_public pb_prod_data
echo "✓ Setup complete."
