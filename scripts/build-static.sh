#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
rm -rf -- dist
mkdir -p dist/src

assets=(
  index.html
  explore_equations.html
  your_fav_equations.html
  share_your_fav_equations.html
  app.js
  style.css
  src/catalog.js
  src/domain.js
)

for asset in "${assets[@]}"; do
  if [[ ! -f "$asset" || -L "$asset" ]]; then
    echo "Missing or symlinked public asset: $asset" >&2
    exit 1
  fi
  cp "$asset" "dist/$asset"
done

echo "Packaged ${#assets[@]} public files in dist/"
