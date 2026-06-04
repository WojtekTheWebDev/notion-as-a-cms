#!/usr/bin/env bash
# Capture a headless screenshot of a URL or local file.
# Usage: screenshot.sh <url-or-file-url> <output.png> [width] [height]
# Works with a local dev server (http://localhost:3000/) or a file:// URL
# (e.g. a prototype HTML export). Finds Chrome/Brave/Chromium across mac/linux.
set -euo pipefail

URL="${1:?usage: screenshot.sh <url> <output.png> [width] [height]}"
OUT="${2:?usage: screenshot.sh <url> <output.png> [width] [height]}"
W="${3:-1400}"
H="${4:-900}"

find_browser() {
  local candidates=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "$(command -v google-chrome 2>/dev/null || true)"
    "$(command -v google-chrome-stable 2>/dev/null || true)"
    "$(command -v chromium 2>/dev/null || true)"
    "$(command -v chromium-browser 2>/dev/null || true)"
    "$(command -v brave-browser 2>/dev/null || true)"
  )
  local b
  for b in "${candidates[@]}"; do
    [ -n "$b" ] && [ -x "$b" ] && { printf '%s' "$b"; return 0; }
  done
  return 1
}

BROWSER="$(find_browser)" || {
  echo "No Chrome/Chromium/Brave found. Install one or screenshot manually." >&2
  exit 1
}

PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE" 2>/dev/null || true' EXIT
rm -f "$OUT"

# Headless Chrome occasionally fails to exit after --screenshot, so run it in
# the background and poll for the file, then kill it.
"$BROWSER" --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size="${W},${H}" \
  --virtual-time-budget=8000 --user-data-dir="$PROFILE" \
  --screenshot="$OUT" "$URL" >/dev/null 2>&1 &
PID=$!

for _ in $(seq 1 40); do
  [ -s "$OUT" ] && break
  sleep 0.5
done
pkill -P "$PID" 2>/dev/null || true
kill "$PID" 2>/dev/null || true
sleep 0.3

if [ -s "$OUT" ]; then
  echo "saved $OUT"
else
  echo "screenshot failed for $URL" >&2
  exit 1
fi
