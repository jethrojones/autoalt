# AutoAlt for Claude Code

A Claude Code plugin that makes adding image alt text the effortless path while
you build.

It ships three things:

- **A skill** (`autoalt`) that teaches Claude how to write good, honest alt text
  and when to mark an image decorative.
- **A `PostToolUse` hook** that runs after Claude edits or writes a file. If the
  file contains images with missing or placeholder alt text, Claude is nudged to
  fix it in the same turn. The hook never blocks an edit.
- **A `/autoalt:check` command** that scans staged files (or paths you pass) for
  images that need alt text.

It checks `.html`, `.htm`, `.jsx`, `.tsx`, `.md`, `.mdx`, `.astro`, `.vue`, and
`.svelte` files. It flags `<img>` tags and Markdown images that are missing alt
text or use placeholders (`image`, `photo`, `graphic`, `TODO`, …), and lets
truly decorative images pass when they use `alt=""` with `aria-hidden="true"` or
`role="presentation"`.

## Install

From inside Claude Code:

```
/plugin marketplace add jethrojones/autoalt
/plugin install autoalt@autoalt
```

Then restart Claude Code (or reload) so the hook and skill load.

`python3` must be on your `PATH` — the checker and hook are plain Python with no
dependencies.

## Try it manually

```sh
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check_alt_text.py" path/to/page.html
```

Or, inside Claude Code, run `/autoalt:check` after staging some changes.

## How the hook decides

The hook is intentionally conservative. It only inspects the single file from the
edit, never blocks, stays silent when there is nothing to report, and degrades to
doing nothing if anything goes wrong. It surfaces findings to Claude as
non-blocking context so the missing descriptions get written without interrupting
your flow.

## Privacy

The checker and hook are fully local. They read files, run regexes, and print
results. They make no network calls and send nothing anywhere.

## License

MIT. Part of the [AutoAlt](https://github.com/jethrojones/autoalt) project —
every image on the internet should have an alt description.
