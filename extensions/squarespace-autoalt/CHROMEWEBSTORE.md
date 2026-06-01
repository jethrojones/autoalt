# Chrome Web Store Listing — AutoAlt for Squarespace

> Last Updated: 2026-06-01

## Store Listing

**Extension Name**
AutoAlt for Squarespace

**Short Description**
Generate premium, descriptive alt text for Squarespace Image Blocks and Asset Libraries automatically using Google Gemini or OpenAI.

**Detailed Description**
Accessibility is vital for modern websites, but writing high-quality image descriptions shouldn't slow down your content editing.

AutoAlt for Squarespace is a powerful, professional Chrome extension built for editors and site builders. It scans your Squarespace editing workspace and injects an intuitive "AutoAlt" button right next to image block text fields and Asset Library details, helping you draft premium alt descriptions with zero friction.

Key Features:
- Seamless Workspace Scanner: Injects a crisp, native-style "AutoAlt" button next to "Alt Text" and "Filename" fields.
- Framework-Compatible Injections: Dispatches standard inputs and bubbles so Squarespace's internal React components register and save changes automatically.
- Multicloud Vision Models: Toggle between Google Gemini (free API key options available) and OpenAI GPT models.
- Interactive Settings Panel: Centered widescreen settings interface, connection diagnostics, and dynamic style rules (Concise, Detailed, Custom).
- Clear, Objective Descriptions: Powered by advanced vision LLMs designed to optimize search indexing (SEO) and assist screen readers.
- Premium Design: Matches Squarespace's luxurious monochrome brand with sharp geometric buttons and carbon gray card popups.

How to Use:
1. Load the extension unpacking into Chrome.
2. Setup your Gemini or OpenAI API keys in the toolbar popup panel.
3. Open your Squarespace web editor, edit an image block or gallery details, and click "AutoAlt".
4. The description is instantly populated, saved, and synced.

**Category**
Accessibility

**Single Purpose**
Automatically generates and applies alt description text to Squarespace Image Blocks and Asset Library inputs.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ✅ Ready | `screenshots/screenshot-1.png` |
| Screenshot 2 | 1280×800 | ✅ Ready | `screenshots/screenshot-2.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to store user settings (API Keys, preferred model, custom description styles) and local generation logs securely. |
| `activeTab` | permissions | Grants temporary, user-gestured access to read the active Squarespace editor structures to analyze preview image assets. |
| `https://*.squarespace.com/*` | host_permissions | Necessary to scan Squarespace config workspaces and insert editing utilities directly alongside image description text boxes. |
| `https://api.openai.com/*` | host_permissions | Allows sending vision API requests to OpenAI models directly from the background service worker. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Allows sending vision API requests to Google Gemini models directly from the background service worker. |

---

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties.
- [x] Data is NOT used for purposes unrelated to the extension's core functionality.
- [x] Data is NOT used for creditworthiness or lending purposes.

---

## Privacy Policy
**Privacy Policy URL**
`https://github.com/jethrojones/autoalt/blob/main/PRIVACY.md`

---

## Distribution
**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

---

## Developer Info
**Publisher Name**: AutoAlt Team
**Contact Email**: support@autoalt.org
**Support URL / Email**: `https://github.com/jethrojones/autoalt/issues`

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1.0 | 2026-06-01 | Initial launch of Squarespace AutoAlt extension with background Vision APIs, custom inputs, and dynamic styling. | Draft |
