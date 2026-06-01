#!/usr/bin/env python3
"""Check project files for images without useful alt text."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

CHECKED_SUFFIXES = {".html", ".htm", ".jsx", ".tsx", ".md", ".mdx", ".astro", ".vue", ".svelte"}
IGNORED_PARTS = {".git", ".codex", "node_modules", "vendor"}
PLACEHOLDER_ALTS = {"", "image", "photo", "picture", "graphic", "placeholder", "todo", "alt"}

IMG_RE = re.compile(r"<img\b(?P<attrs>[^>]*?)>", re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"\balt\s*=\s*(?:\"(?P<double>[^\"]*)\"|'(?P<single>[^']*)'|\{(?P<expr>[^}]*)\})", re.IGNORECASE | re.DOTALL)
ARIA_HIDDEN_RE = re.compile(r"\baria-hidden\s*=\s*(?:\"true\"|'true'|\{true\})", re.IGNORECASE)
ROLE_PRESENTATION_RE = re.compile(r"\brole\s*=\s*(?:\"(?:presentation|none)\"|'(?:presentation|none)')", re.IGNORECASE)
MARKDOWN_IMAGE_RE = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<target>[^)]+)\)")
FENCED_CODE_RE = re.compile(r"(^|\n)```.*?(\n```|$)", re.DOTALL)


def main() -> int:
    parser = argparse.ArgumentParser(description="Find images that need meaningful alt text.")
    parser.add_argument("paths", nargs="*", help="Files or directories to scan.")
    parser.add_argument("--staged", action="store_true", help="Scan staged files in the current git repo.")
    args = parser.parse_args()

    paths = staged_paths() if args.staged else [Path(path) for path in args.paths]
    if not paths:
        paths = [Path(".")]

    findings = []
    for file_path in expand_paths(paths):
        findings.extend(check_file(file_path))

    if findings:
        print("AutoAlt found images that need alt text:\n")
        for finding in findings:
            print(f"{finding.path}:{finding.line}: {finding.message}")
        print("\nAdd a concise, specific alt description or mark truly decorative images with alt=\"\" and aria-hidden=\"true\".")
        return 1

    print("AutoAlt check passed.")
    return 0


def staged_paths() -> list[Path]:
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACMRT"],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr.strip() or "Could not read staged git files.", file=sys.stderr)
        return []
    return [Path(line) for line in result.stdout.splitlines() if line.strip()]


def expand_paths(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if not path.exists():
            continue
        if path.is_dir():
            files.extend(
                child for child in path.rglob("*")
                if child.is_file() and child.suffix.lower() in CHECKED_SUFFIXES and not should_skip(child)
            )
        elif path.suffix.lower() in CHECKED_SUFFIXES and not should_skip(path):
            files.append(path)
    return sorted(set(files))


def should_skip(path: Path) -> bool:
    return any(part in IGNORED_PARTS for part in path.parts)


class Finding:
    def __init__(self, path: Path, line: int, message: str) -> None:
        self.path = path
        self.line = line
        self.message = message


def check_file(path: Path) -> list[Finding]:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return []

    findings: list[Finding] = []
    if path.suffix.lower() in {".md", ".mdx"}:
        scan_text = mask_fenced_code(text)
        findings.extend(check_markdown_images(path, scan_text))
        findings.extend(check_img_tags(path, scan_text))
        return findings

    findings.extend(check_img_tags(path, text))
    return findings


def mask_fenced_code(text: str) -> str:
    def replace(match: re.Match[str]) -> str:
        return "".join("\n" if char == "\n" else " " for char in match.group(0))

    return FENCED_CODE_RE.sub(replace, text)


def check_markdown_images(path: Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    for match in MARKDOWN_IMAGE_RE.finditer(text):
        alt = normalize_alt(match.group("alt"))
        if alt in PLACEHOLDER_ALTS:
            findings.append(Finding(path, line_for(text, match.start()), "Markdown image has missing or placeholder alt text."))
    return findings


def check_img_tags(path: Path, text: str) -> list[Finding]:
    findings: list[Finding] = []
    for match in IMG_RE.finditer(text):
        attrs = match.group("attrs")
        alt_match = ALT_RE.search(attrs)
        decorative = bool(ARIA_HIDDEN_RE.search(attrs) or ROLE_PRESENTATION_RE.search(attrs))

        if not alt_match:
            findings.append(Finding(path, line_for(text, match.start()), "<img> is missing an alt attribute."))
            continue

        alt_value = next((value for value in alt_match.groupdict().values() if value is not None), "")
        alt = normalize_alt(alt_value)

        if alt == "" and decorative:
            continue

        if alt in PLACEHOLDER_ALTS:
            findings.append(Finding(path, line_for(text, match.start()), "<img> has missing or placeholder alt text."))
    return findings


def normalize_alt(value: str) -> str:
    normalized = value.strip().strip("\"'").strip()
    if normalized.startswith("{") and normalized.endswith("}"):
        normalized = normalized[1:-1].strip()
    return normalized.lower()


def line_for(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


if __name__ == "__main__":
    raise SystemExit(main())
