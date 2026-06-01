const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

const STYLE_PROMPTS = {
  concise: "Write useful alt text for this image. Be extremely objective, precise, and concise. Return only the alt text, under 120 characters. Do not use filler words like 'image of'.",
  detailed: "Write rich, detailed alt text for this image. Describe the main subject, background elements, colors, text visible in the image, and any atmospheric details. Avoid opinion or speculation. Be thorough, aiming for 200-280 characters.",
  custom: "Write alt text for this image, strictly following these instructions: "
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AUTOALT_GENERATE_ALT") {
    generateAltText(message.imageDataUrl)
      .then((altText) => {
        saveToHistory(altText);
        sendResponse({ ok: true, altText });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === "AUTOALT_TEST_API") {
    testApiKey(message.provider, message.apiKey)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return false;
});

async function saveToHistory(altText) {
  try {
    const { history = [] } = await chrome.storage.local.get("history");
    const updated = [altText, ...history.filter(t => t !== altText)].slice(0, 10);
    await chrome.storage.local.set({ history: updated });
  } catch (e) {
    console.error("Failed to save history", e);
  }
}

async function generateAltText(imageDataUrl) {
  if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
    throw new Error("AutoAlt needs an uploaded image preview before it can generate alt text.");
  }

  const settings = await chrome.storage.local.get({
    provider: "gemini",
    apiKey: "",
    geminiApiKey: "",
    model: "",
    style: "concise",
    customPrompt: ""
  });

  const provider = settings.provider || "gemini";
  let activeKey = provider === "gemini" ? settings.geminiApiKey : settings.apiKey;
  
  if (!activeKey) {
    throw new Error(`Please add a ${provider === "gemini" ? "Gemini" : "OpenAI"} API key in the AutoAlt extension popup or options.`);
  }

  let prompt = STYLE_PROMPTS[settings.style || "concise"];
  if (settings.style === "custom") {
    prompt += settings.customPrompt || "Describe this image objectively.";
  }

  if (provider === "gemini") {
    const model = settings.model || DEFAULT_GEMINI_MODEL;
    return callGemini(imageDataUrl, prompt, activeKey, model);
  } else {
    const model = settings.model || DEFAULT_OPENAI_MODEL;
    return callOpenAI(imageDataUrl, prompt, activeKey, model);
  }
}

async function callGemini(imageDataUrl, prompt, apiKey, model) {
  const parts = imageDataUrl.split(";base64,");
  if (parts.length !== 2) {
    throw new Error("Malformed image URL data.");
  }
  const mimeType = parts[0].replace("data:", "");
  const base64Data = parts[1];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`Gemini Generation failed: ${errorMsg}`);
  }

  const altText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!altText) {
    throw new Error("Gemini returned an empty description.");
  }

  return cleanAltText(altText);
}

async function callOpenAI(imageDataUrl, prompt, apiKey, model) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 150
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`OpenAI Generation failed: ${errorMsg}`);
  }

  const altText = data?.choices?.[0]?.message?.content;
  if (!altText) {
    throw new Error("OpenAI returned an empty description.");
  }

  return cleanAltText(altText);
}

function cleanAltText(text) {
  return text.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^alt text:\s*/i, "")
    .replace(/^description:\s*/i, "")
    .slice(0, 280);
}

async function testApiKey(provider, apiKey) {
  if (!apiKey) {
    throw new Error("API Key cannot be blank.");
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || "Invalid Gemini API Key");
    }
  } else {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEFAULT_OPENAI_MODEL,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || "Invalid OpenAI API Key");
    }
  }
  return true;
}
