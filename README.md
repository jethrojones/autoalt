# AutoAlt

Every image on the internet should have an alt description.

Not someday. Not only when someone remembers. Not only on carefully tended websites with accessibility budgets and patient editors.

Every image.

AutoAlt is an open source project building the tools that make that possible: browser extensions, CMS plugins, developer hooks, agent skills, and publishing integrations that help people add useful alt text before images go live.

The goal is simple: make the accessible path the effortless path.

## Why This Exists

The web is full of images that silently disappear for people using screen readers, low-bandwidth modes, search, translation tools, and assistive technology. Sometimes the image is the joke. Sometimes it is the chart. Sometimes it is the product. Sometimes it is the memory.

When alt text is missing, part of the internet goes missing with it.

Most people do not skip alt text because they do not care. They skip it because the publishing tool makes it easy to forget, hard to write, or invisible until someone else pays the cost.

AutoAlt exists to change that default.

We believe:

- Accessibility should be built into the moment of publishing.
- People should keep control over what gets posted in their name.
- Generated alt text should be helpful, honest, editable, and never overwrite human care.
- Small tools, placed in the right workflow, can make the web better at enormous scale.

## What We Are Building

AutoAlt is a family of plugins and automation helpers for the places where images are created, uploaded, drafted, and published.

Today, this repo includes early MVPs:

- `extensions/x-autoalt`: a browser extension for X.com/Twitter compose screens. It uses the logged-in user's normal account session, generates a description for an uploaded image, opens X's alt-text dialog, and inserts the generated description.
- `plugins/wordpress/autoalt`: a WordPress plugin that generates alt text for Media Library uploads when the image does not already have alt text.
- `.codex/skills/autoalt`: a repo-local Codex skill that teaches coding agents to preserve image accessibility while building.
- `plugins/claude/autoalt`: a downloadable Claude Code plugin (skill + post-edit hook + `/autoalt:check` command) that catches missing alt text while you code.
- `.githooks/pre-commit`: a developer hook that catches missing or placeholder alt text before code is committed.

Future targets include Bluesky, Mastodon, Instagram workflows, Shopify, Webflow, Notion, Ghost, Drupal, static-site generators, design handoff tools, and anywhere else images make their way into public view.

## Principles

AutoAlt should be useful before it is clever.

Generated descriptions should be specific, concise, and grounded in the image. They should include important visible text. They should avoid filler like "image of" unless the medium matters. They should never pretend to know more than the image shows.

AutoAlt should preserve human authorship.

If a person has already written alt text, we do not overwrite it. If the generated text is not right, the user should be able to edit it before publishing. Automation should remove friction, not remove judgment.

AutoAlt should meet people where they already work.

The best accessibility tool is the one that appears at the exact moment someone needs it. That is why this project starts with plugins, extensions, hooks, and agent workflows instead of a standalone destination.

## Use The X.com Extension

The X.com extension is an unpacked Chrome-compatible extension for now.

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click "Load unpacked".
4. Select `extensions/x-autoalt`.
5. Open the extension options page and save an OpenAI API key.
6. On X.com, add an image to a post draft and click `AutoAlt`.

The extension keeps the API key in browser extension local storage and never asks for X credentials. It works through the X.com page where the user is already logged in.

## Use The WordPress Plugin

Copy or symlink `plugins/wordpress/autoalt` into `wp-content/plugins/autoalt`, activate `AutoAlt`, then add an API key under `Settings -> AutoAlt`.

When enabled, the plugin watches new image uploads. If the image has no existing alt text, it sends the local image file to the configured model and saves the generated description to `_wp_attachment_image_alt`.

## Use The Claude Code Plugin

If you build with Claude Code, install the plugin so Claude writes alt text as it
edits and warns you when an image is missing one.

```text
/plugin marketplace add jethrojones/autoalt
/plugin install autoalt@autoalt
```

It adds:

- the `autoalt` skill, which teaches Claude how to write honest, specific alt text,
- a `PostToolUse` hook that flags images with missing or placeholder alt text in
  any file Claude edits (HTML, JSX/TSX, Markdown/MDX, Astro, Vue, Svelte) without
  blocking the edit,
- a `/autoalt:check` command that scans staged files or paths you pass.

The plugin is fully local and makes no network calls. See
`plugins/claude/autoalt/README.md` for details.

## Use The Agent Hook

Install the repo hooks:

```sh
./scripts/install-hooks.sh
```

Run the checker manually:

```sh
python3 .codex/skills/autoalt/scripts/check_alt_text.py --staged
```

The hook is intentionally conservative. It catches missing or placeholder alt text and lets explicitly decorative images pass when they use `alt=""` with `aria-hidden="true"` or `role="presentation"`.

## Contribute

You do not need to be an accessibility expert to help. You only need to care that the web should be available to more people.

Good first contributions:

- Test the X.com extension and report where the compose UI detection breaks.
- Improve alt text prompts for different image types: screenshots, charts, memes, products, portraits, diagrams, and text-heavy graphics.
- Add plugins for more publishing platforms.
- Add tests around the alt-text checker.
- Improve the WordPress plugin settings, logging, retries, and privacy controls.
- Package the browser extension for easier installation.
- Write examples of excellent alt text and weak alt text so the project has a shared standard.

Larger contributions:

- Build a shared AutoAlt core library for prompt construction, response parsing, and provider support.
- Add support for multiple model providers and local vision models.
- Create review workflows where generated alt text can be queued, approved, edited, or rejected.
- Build integrations for CMSs, social platforms, ecommerce tools, and static-site generators.
- Add telemetry-free quality checks that help users improve descriptions without collecting private content.

## Development

This project is intentionally lightweight while the shape of the ecosystem is still emerging.

Run the current checks:

```sh
python3 .codex/skills/autoalt/scripts/check_alt_text.py .
python3 plugins/claude/autoalt/scripts/check_alt_text.py .
node --check extensions/x-autoalt/background.js
node --check extensions/x-autoalt/content.js
node --check extensions/x-autoalt/options.js
```

Validate the Claude Code plugin and marketplace manifests:

```sh
claude plugin validate ./plugins/claude/autoalt
claude plugin validate .
```

If you are working on the WordPress plugin, run PHP lint in an environment with PHP installed:

```sh
php -l plugins/wordpress/autoalt/autoalt.php
```

## A Note On Responsibility

AI can help make alt text more common. It cannot replace care.

Some images need context from the author. Some need domain knowledge. Some should not be published at all. AutoAlt should make the first draft easier, but the final responsibility stays with the person and platform publishing the image.

That is not a limitation of the mission. It is part of the mission.

## Join Us

The internet became visual faster than it became accessible. We can help close that gap.

One plugin at a time. One upload flow at a time. One missing description at a time.

If you have ever wished the web were a little more thoughtful, there is room for you here.
