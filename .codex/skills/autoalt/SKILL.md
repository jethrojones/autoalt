---
name: autoalt
description: Ensure images published by web projects, CMS plugins, browser extensions, Markdown, MDX, HTML, JSX, TSX, Astro, Vue, and Svelte have useful alt descriptions. Use when Codex adds, edits, reviews, or publishes image markup; builds plugins or UI that handle user-uploaded images; audits accessibility; or prepares code for commit/deployment where images may be missing alt text.
---

# AutoAlt

## Overview

Use this skill to make alt text a normal part of shipping. When adding or reviewing images, write concise, specific descriptions for informative images and mark only truly decorative images as decorative.

## Workflow

1. Inspect the changed files for image publishing surfaces: `<img>`, framework image components, Markdown images, CMS upload flows, Open Graph images, gallery templates, and media blocks.
2. Add meaningful alt text at the source of truth. Prefer model/user/content-derived text over generic labels.
3. Preserve accessibility semantics:
   - Informative images need specific `alt` text.
   - Decorative images may use `alt=""` only when paired with `aria-hidden="true"` or `role="presentation"`/`role="none"`.
   - Linked images need alt text that describes the link target or action.
4. Run the checker before committing or publishing.

```sh
python3 .codex/skills/autoalt/scripts/check_alt_text.py --staged
```

When there are no staged files, scan specific paths:

```sh
python3 .codex/skills/autoalt/scripts/check_alt_text.py path/to/file.mdx path/to/components
```

## Alt Text Rules

- Describe what matters for understanding the page or post.
- Keep it short enough to scan, usually under 160 characters.
- Include visible words when the text is relevant.
- Do not use placeholders like `image`, `photo`, `graphic`, `TODO`, or `alt`.
- Do not repeat nearby captions unless the image needs that same context to stand alone.
- Do not write "image of" or "picture of" unless the medium is important.

## Plugin And Upload Flows

When building CMS or social publishing integrations, generate alt text before publication and save it to the platform's native alt field. Do not overwrite user-provided alt text. If generation fails, leave the user's workflow intact and expose a clear retry path.

For model-generated alt text, send the smallest useful image representation, use an objective prompt, and cap the output length. Store API keys in the platform's normal secure settings area, not in source code.

## Hook

This repo includes `.githooks/pre-commit`, which runs `scripts/check_alt_text.py --staged`. Install it with:

```sh
./scripts/install-hooks.sh
```
