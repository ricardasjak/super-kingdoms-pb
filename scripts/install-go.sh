#!/bin/bash
set -e

GO_VERSION="1.24.0"
INSTALL_DIR="$HOME/.local"
GO_BIN="$INSTALL_DIR/go/bin/go"

mkdir -p "$INSTALL_DIR/bin"
ln -sf "$GO_BIN" "$INSTALL_DIR/bin/go"
ln -sf "$INSTALL_DIR/go/bin/gofmt" "$INSTALL_DIR/bin/gofmt"

if [ -f "$GO_BIN" ]; then
  echo "✓ Go already installed at $GO_BIN ($($GO_BIN version))"
  exit 0
fi

echo "→ Downloading Go v$GO_VERSION for linux-amd64..."
mkdir -p "$INSTALL_DIR"
URL="https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz"

curl -sL "$URL" -o /tmp/go.tar.gz
rm -rf "$INSTALL_DIR/go"
tar -C "$INSTALL_DIR" -xzf /tmp/go.tar.gz
rm /tmp/go.tar.gz

mkdir -p "$INSTALL_DIR/bin"
ln -sf "$GO_BIN" "$INSTALL_DIR/bin/go"
ln -sf "$INSTALL_DIR/go/bin/gofmt" "$INSTALL_DIR/bin/gofmt"

echo "✓ Go v$GO_VERSION installed successfully to $INSTALL_DIR/go"
"$GO_BIN" version

