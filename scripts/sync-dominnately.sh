#!/usr/bin/env bash
set -euo pipefail

# Script to sync DomInNATEly repository files into this portfolio app
UPSTREAM_REPO="https://github.com/Nate-Mina/DomInNATEly.git"
BRANCH="main"
TMP_DIR=$(mktemp -d)

echo "==> Cloning $UPSTREAM_REPO ($BRANCH) into temporary directory..."
git clone --depth 1 --branch "$BRANCH" "$UPSTREAM_REPO" "$TMP_DIR"

echo "==> Syncing src files to src/music-gallery..."
mkdir -p src/music-gallery
# Copy all src files
cp -r "$TMP_DIR"/src/* src/music-gallery/

echo "==> Updating TikTok handle references if needed..."
find src/music-gallery -type f -exec sed -i 's|https://tiktok\.com/@domInNATEly|https://www.tiktok.com/@dominnately|g' {} + 2>/dev/null || true
find src/music-gallery -type f -exec sed -i 's|@domInNATEly|@dominnately|g' {} + 2>/dev/null || true

echo "==> Syncing public assets/images..."
mkdir -p public/assets/images
if [ -d "$TMP_DIR/src/assets/images" ]; then
  cp -r "$TMP_DIR"/src/assets/images/* public/assets/images/
fi

echo "==> Cleaning up temporary directory..."
rm -rf "$TMP_DIR"

echo "==> Sync complete!"
