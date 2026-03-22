#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/ (e.g. brew install gh)"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Not logged in. Run: gh auth login"
  exit 1
fi

NAME="${1:-racer}"

if git remote get-url origin >/dev/null 2>&1; then
  echo "Remote 'origin' already exists. Push with: git push -u origin main"
  exit 1
fi

gh repo create "$NAME" --public --source=. --remote=origin --push

echo "Done. Remote: origin → $(git remote get-url origin)"
