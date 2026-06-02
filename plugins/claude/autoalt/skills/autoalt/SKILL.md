---
name: autoalt
description: Ensure images shipped by web projects have useful alt descriptions. Use when Claude adds, edits, reviews, or publishes image markup (HTML, JSX, TSX, Markdown, MDX, Astro, Vue, Svelte), builds plugins or UI that handle user-uploaded images, audits accessibility, or prepares code for commit or deployment where images may be missing alt text.
---

# AutoAlt

## Overview

Use this skill to make alt text a normal part of shipping. When adding or
reviewing images, write concise, specific descriptions for informative images
and mark only truly decorative images as decorative. Every image that conveys
meaning should be understandable to someone using a screen reader, low-bandwidth
mode, search, or translation.

## Workflow

1. Inspect the changed files for image publishing surfaces: `<img>`, framework
   image components (`next/image`, `Image`, `<v-img>`, etc.), Markdown images,
   CMS upload flows, Open Graph images, gallery templates, and media blocks.
2. Add meaningful alt text at the source of truth. Prefer text derived from the
   content, the model, or the user over generic labels.
3. Preserve accessibility semantics:
   - Informative images need specific `alt` text.
   - Decorative images may use `alt=""` only when paired with
     `aria-hidden="true"` or `role="presentation"`/`role="none"`.
   - Linked images need alt text that describes the link target or action.
4. Run the checker before committing or publishing.

```sh
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check_alt_text.py" --staged
```

When there are no staged files, scan specific paths:

```sh
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check_alt_text.py" path/to/file.mdx path/to/components
```

You can also run `/autoalt:check` to scan staged files (or paths you pass).

## Alt Text Rules

- Describe what matters for understanding the page or post.
- Keep it short enough to scan, usually under 160 characters.
- Include visible words when the text is relevant.
- Do not use placeholders like `image`, `photo`, `graphic`, `TODO`, or `alt`.
- Do not repeat nearby captions unless the image needs that same context to
  stand alone.
- Do not write "image of" or "picture of" unless the medium is important.
- Do not invent details the image does not show.

## Plugin And Upload Flows

When building CMS or social publishing integrations, generate alt text before
publication and save it to the platform's native alt field. Do not overwrite
user-provided alt text. If generation fails, leave the user's workflow intact
and expose a clear retry path.

For model-generated alt text, send the smallest useful image representation, use
an objective prompt, and cap the output length. Store API keys in the platform's
normal secure settings area, not in source code.

## Automatic Hook

This plugin also installs a `PostToolUse` hook that runs after Claude edits or
writes a file. When the touched file contains images with missing or placeholder
alt text, the hook surfaces a note so the alt text can be fixed in the same turn.
The hook never blocks an edit.
