# Chrome Web Store Listing — AutoAlt for X

> Last Updated: 2026-06-01

## Store Listing

**Extension Name**
AutoAlt for X

**Short Description**
Generate premium, descriptive alt text for Twitter/X post drafts automatically using Google Gemini or OpenAI.

**Detailed Description**
Every image on the internet should have an alt description. Not only when someone remembers, but automatically, at the exact moment of publishing.

AutoAlt for X is a lightweight, open-source accessibility enhancer that integrates seamlessly into your X.com compose screen. By analyzing the images you upload in real time, AutoAlt writes clear, accurate, and objective image descriptions so you can publish accessible posts with a single click.

Key Features:
- Seamless DOM integration: Adds a beautiful, native-looking "AutoAlt" button directly in your Tweet composer bar.
- Multicloud Vision Models: Choose between Google Gemini (extremely fast with a generous free tier) or OpenAI GPT models.
- Beautiful Settings Panel: Easily test your API connection, toggle password visibility, and view connection status in a gorgeous Glassmorphism card.
- Tailored Alt Text Styles: Select "Concise" (objective, under 120 chars) or "Detailed" (rich context and text overlays), or supply your own custom prompts.
- Historical Generations Log: Audit, copy, or reuse your last 5 generated alt text descriptions.
- Privacy First: Keeps your credentials saved securely in local storage. We never ask for, collect, or transmit your social account credentials.

How to Use:
1. Load AutoAlt unpacked in your Chrome-compatible browser.
2. Click the AutoAlt icon in your toolbar, choose your AI provider, enter your API key, and hit Save. (Click "Test Connection" to verify!).
3. Open X.com, drag in an image, and click "AutoAlt" in your draft composer.
4. AutoAlt will write and save the description instantly.

**Category**
Accessibility

**Single Purpose**
Automatically generates and applies alt description text to uploaded images in X.com tweet drafts.

**Primary Language**
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ✅ Ready | `icons/icon-128.png` |
| Screenshot 1 | 1280×800 | ✅ Ready | `screenshots/screenshot-1.png` |
| Screenshot 2 | 1280×800 | ✅ Ready | `screenshots/screenshot-2.png` |
| Screenshot 3 | 1280×800 | ✅ Ready | `screenshots/screenshot-3.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to store user settings (API Keys, preferred model, custom description styles) and local generation history securely. |
| `activeTab` | permissions | Grants temporary, user-gestured access to read the active X.com draft element structure to process image sources. |
| `https://x.com/*` | host_permissions | Necessary to inject content scripts, detect composer components, and inject the "AutoAlt" buttons into Twitter/X compose areas. |
| `https://twitter.com/*` | host_permissions | Necessary to inject content scripts, detect composer components, and inject the "AutoAlt" buttons into Twitter/X compose areas. |
| `https://api.openai.com/*` | host_permissions | Allows the background script to send secure vision API requests to OpenAI models directly from the extension context. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Allows the background script to send secure vision API requests to Google Gemini models directly from the extension context. |

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
| 0.2.0 | 2026-06-01 | Re-architected extension popup, added Google Gemini support, history tabs, and connection testers. | Draft |
| 0.1.0 | 2026-05-15 | Initial baseline MVP for X alt-text injection. | Published |
