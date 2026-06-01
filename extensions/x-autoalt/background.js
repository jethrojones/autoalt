const DEFAULT_MODEL = "gpt-5-mini";
const ALT_PROMPT = [
  "Write useful alt text for this image.",
  "Be specific, objective, and concise.",
  "Do not start with phrases like 'image of' or 'picture of'.",
  "If visible text is important, include it.",
  "Return only the alt text, 160 characters or fewer."
].join(" ");

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "AUTOALT_GENERATE_ALT") {
    return false;
  }

  generateAltText(message.imageDataUrl)
    .then((altText) => sendResponse({ ok: true, altText }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function generateAltText(imageDataUrl) {
  if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
    throw new Error("AutoAlt needs an uploaded image preview before it can generate alt text.");
  }

  const settings = await chrome.storage.local.get({
    apiKey: "",
    model: DEFAULT_MODEL
  });

  if (!settings.apiKey) {
    throw new Error("Add an OpenAI API key in the AutoAlt extension options first.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: settings.model || DEFAULT_MODEL,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: ALT_PROMPT },
            { type: "input_image", image_url: imageDataUrl, detail: "auto" }
          ]
        }
      ],
      max_output_tokens: 80
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Alt text generation failed: ${detail}`);
  }

  const altText = extractText(data).trim().replace(/^["']|["']$/g, "");

  if (!altText) {
    throw new Error("The model returned an empty alt description.");
  }

  return altText.slice(0, 280);
}

function extractText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join(" ");
}
