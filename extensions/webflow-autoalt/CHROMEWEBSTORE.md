# Chrome Web Store Listing — AutoAlt for Webflow

> Last Updated: 2026-06-01

## Store Listing

**Extension Name**
AutoAlt for Webflow

**Short Description**
Generate premium, descriptive alt text for Webflow Designer and Asset Managers automatically using Google Gemini or OpenAI.

**Detailed Description**
Bring seamless accessibility design directly into your Webflow canvas.

AutoAlt for Webflow is a professional browser utility built specifically for Webflow designers. It watches your Webflow settings interface and assets drawer in real time, injecting a fast and responsive "AutoAlt" button next to "Alt Text" fields so you can maintain web standard compliance (WCAG) and boost search visibility (SEO) effortlessly.

Key Features:
- Webflow Designer Integration: Blends perfectly into the right Settings Pane (D) and left Assets Manager Popovers.
- Active Bubble Event Triggers: Bypasses standard DOM barriers to update Webflow's internal virtual React state, ensuring alt changes are properly saved and synced.
- Multicloud Vision Models: Choose Google Gemini (free keys available) or OpenAI GPT models.
- Premium Developer Aesthetic: Visual dark theme built with modern slate backgrounds and glowing neon-blue/purple highlights matching Webflow.
- Dynamic Style Settings: Choose "Concise" or "Detailed", or supply your own custom prompts in a beautiful Glassmorphism setup.

How to Use:
1. Load the extension unpacked in Chrome.
2. Enter your Gemini or OpenAI API keys in the extension popup.
3. Open a Webflow Designer project, select an image element, open its settings, and click "AutoAlt".
4. The custom description will be generated and saved immediately.

**Category**
Accessibility

**Single Purpose**
Automatically generates and applies alt description text to Webflow Designer settings and Assets panel inputs.

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
| `storage` | permissions | Required to store user settings (API Keys, preferred model, custom description styles) and local generation history securely. |
| `activeTab` | permissions | Grants temporary, user-gestured access to read the active Webflow Designer panes to analyze image previews. |
| `https://webflow.com/*` | host_permissions | Necessary to inject content scripts, detect composer components, and inject the "AutoAlt" buttons into Webflow Designer workspaces. |
| `https://*.webflow.com/*` | host_permissions | Necessary to inject content scripts, detect composer components, and inject the "AutoAlt" buttons into Webflow Designer workspaces. |
| `https://*.webflow.io/*` | host_permissions | Necessary to inject content scripts, detect composer components, and inject the "AutoAlt" buttons into Webflow staging sites. |
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
| 0.1.0 | 2026-06-01 | Initial launch of Webflow AutoAlt extension with background Vision APIs, custom inputs, and dynamic styling. | Draft |
