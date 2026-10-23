#!/usr/bin/env bash
set -euo pipefail
# Install the exact upstream npm release into Android WebView assets.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS="$ROOT/app/src/main/assets"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
npm install --prefix "$TMP" --no-audit --no-fund --ignore-scripts --save-exact fairy-stockfish-nnue.wasm@1.1.12
PKG="$TMP/node_modules/fairy-stockfish-nnue.wasm"
for name in stockfish.js stockfish.wasm stockfish.worker.js Copying.txt AUTHORS; do
  test -s "$PKG/$name" || { echo "Missing upstream file: $name" >&2; exit 1; }
done
install -m 644 "$PKG/stockfish.js" "$ASSETS/fairy-stockfish-core.js"
install -m 644 "$PKG/stockfish.wasm" "$ASSETS/stockfish.wasm"
install -m 644 "$PKG/stockfish.worker.js" "$ASSETS/stockfish.worker.js"
install -m 644 "$PKG/Copying.txt" "$ASSETS/fairy-stockfish-Copying.txt"
install -m 644 "$PKG/AUTHORS" "$ASSETS/fairy-stockfish-AUTHORS.txt"
echo "Fairy-Stockfish WASM assets installed from npm release 1.1.12."
