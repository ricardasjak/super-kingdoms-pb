#!/bin/bash
set -e

# Ensure Go compiler is in PATH
if ! command -v go &> /dev/null; then
  if [ -f "$HOME/.local/go/bin/go" ]; then
    export PATH="$HOME/.local/go/bin:$PATH"
  else
    echo "→ Installing Go..."
    bash scripts/install-go.sh
    export PATH="$HOME/.local/go/bin:$PATH"
  fi
fi

echo "→ Building custom PocketBase binary with native multi-threaded tick engine..."
mkdir -p pb
go build -o pb/pocketbase cmd/server/main.go
chmod +x pb/pocketbase
echo "✓ Successfully built pb/pocketbase ($(./pb/pocketbase --version))"
