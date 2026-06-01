---
description: Scan files for images missing useful alt text (defaults to staged files).
---

Run the AutoAlt checker to find images with missing or placeholder alt text.

If the user passed paths in `$ARGUMENTS`, scan those:

```sh
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check_alt_text.py" $ARGUMENTS
```

Otherwise scan the staged files in the current git repo:

```sh
python3 "${CLAUDE_PLUGIN_ROOT}/scripts/check_alt_text.py" --staged
```

For each finding, propose a concise, specific alt description following the
AutoAlt rules (under ~160 characters, no "image of"/placeholders; decorative
images need `alt=""` plus `aria-hidden="true"` or `role="presentation"`), then
apply the fix at the source of truth. Do not overwrite alt text a human already
wrote.
