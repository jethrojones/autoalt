#!/bin/sh

set -eu

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "AutoAlt git hooks installed."
