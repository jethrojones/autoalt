#!/usr/bin/env python3
"""AutoAlt PostToolUse hook.

Runs after Claude edits or writes a file. If the touched file is an image
publishing surface (HTML/JSX/TSX/MD/MDX/Astro/Vue/Svelte) and contains images
with missing or placeholder alt text, it feeds a non-blocking note back to
Claude so the alt text gets fixed in the same turn.

It reads the hook payload from stdin, never blocks the edit, and stays silent
when there is nothing to report or when anything goes wrong.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

try:
    from check_alt_text import CHECKED_SUFFIXES, check_file, should_skip
except Exception:  # pragma: no cover - if the checker can't load, do nothing.
    sys.exit(0)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    tool_input = payload.get("tool_input") or {}
    file_path = tool_input.get("file_path") or tool_input.get("filePath") or ""
    if not file_path:
        return 0

    path = Path(file_path)
    if path.suffix.lower() not in CHECKED_SUFFIXES or should_skip(path) or not path.is_file():
        return 0

    findings = check_file(path)
    if not findings:
        return 0

    lines = "\n".join(f"  {finding.path}:{finding.line}: {finding.message}" for finding in findings)
    context = (
        "AutoAlt: the file you just edited has images that need alt text:\n"
        f"{lines}\n\n"
        "Please add a concise, specific alt description for each (usually under ~160 characters, "
        "no 'image of'/'photo of', no placeholders like 'image' or 'TODO'). "
        "Only mark an image decorative with alt=\"\" if you also add aria-hidden=\"true\" or "
        "role=\"presentation\"."
    )

    print(json.dumps({
        "continue": True,
        "suppressOutput": True,
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": context,
        },
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
