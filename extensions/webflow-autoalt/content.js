const BUTTON_CLASS = "autoalt-button";
const TOAST_CLASS = "autoalt-toast";

// Scanners for alt description input fields inside Webflow Designer panels
const ALT_INPUT_SELECTORS = [
  'input[placeholder*="Alt text"]',
  'input[placeholder*="Alt Text"]',
  'input[placeholder*="Custom description"]',
  'input.w-image-settings-alt-text'
];

const observer = new MutationObserver(() => {
  requestAnimationFrame(() => {
    injectButtons();
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

requestAnimationFrame(() => {
  injectButtons();
});

async function injectButtons() {
  const inputs = document.querySelectorAll(ALT_INPUT_SELECTORS.join(","));
  const BATCH_SIZE = 10;

  for (let i = 0; i < inputs.length; i += BATCH_SIZE) {
    const batch = Array.from(inputs).slice(i, i + BATCH_SIZE);

    batch.forEach((input) => {
      const parent = input.parentElement;
      if (!parent || parent.querySelector(`.${BUTTON_CLASS}`)) {
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = BUTTON_CLASS;
      button.innerHTML = `<span>✨</span><span>AutoAlt</span>`;
      button.title = "Generate alt text for this image automatically";
      button.addEventListener("click", () => handleGenerate(input, button));

      // Inject the button right after the input field in the field container
      if (input.nextSibling) {
        parent.insertBefore(button, input.nextSibling);
      } else {
        parent.appendChild(button);
      }
    });

    if (globalThis.scheduler?.yield) {
      await scheduler.yield();
    }
  }
}

async function handleGenerate(input, button) {
  const originalHTML = button.innerHTML;
  try {
    button.disabled = true;
    button.innerHTML = `<span>⚡</span><span>Writing...</span>`;

    const image = findPreviewImage(input);
    if (!image) {
      throw new Error("No image preview found in Webflow designer settings.");
    }

    showToast("Analyzing Webflow asset...", "loading");

    const imageDataUrl = await imageElementToDataUrl(image);
    showToast("Generating alt description...", "loading");

    const result = await chrome.runtime.sendMessage({
      type: "AUTOALT_GENERATE_ALT",
      imageDataUrl
    });

    if (!result?.ok) {
      throw new Error(result?.error || "AutoAlt could not generate a description.");
    }

    showToast("Applying to designer...", "loading");
    setNativeValue(input, result.altText);
    showToast("Alt description successfully added!", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

function findPreviewImage(input) {
  // Look in the Webflow panels, side drawers, popovers, or the active canvas
  const panel = 
    input.closest('.w-image-settings-pane') || 
    input.closest('.w-assets-panel') || 
    input.closest('.w-popover') || 
    input.closest('form') || 
    document.body;

  // Search inside for image preview tags
  const images = [...panel.querySelectorAll('img')];
  if (images.length === 0) return null;

  // Find an image that looks like a high-res designer asset
  const preview = images.find(img => {
    const src = img.src || "";
    const rect = img.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) return false;
    
    return src.includes("webflow.com") || src.includes("uploads-ssl.webflow.com") || src.startsWith("blob:") || src.startsWith("data:");
  });

  // Fallback to the largest image element inside the panel
  if (!preview) {
    return images.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return (bRect.width * bRect.height) - (aRect.width * aRect.height);
    })[0];
  }

  return preview;
}

async function imageElementToDataUrl(image) {
  if (image.src.startsWith("data:image/")) {
    return image.src;
  }

  const response = await fetch(image.src);
  if (!response.ok) {
    throw new Error("Could not read Webflow asset content (CORS or network error).");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("The selected preview is not an image asset.");
  }

  if (blob.size > 20 * 1024 * 1024) {
    throw new Error("Image is too large for the current AutoAlt limit.");
  }

  return blobToDataUrl(blob);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not prepare asset data URL."));
    reader.readAsDataURL(blob);
  });
}

function setNativeValue(element, value) {
  // Dispatches framework event alerts so Webflow Designer detects the manual input update
  const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}

let toastTimer = null;

function showToast(message, type = "success") {
  const existing = document.querySelector(`.${TOAST_CLASS}`);
  existing?.remove();

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  const toast = document.createElement("div");
  toast.className = TOAST_CLASS;

  let iconHTML = "";
  if (type === "loading") {
    iconHTML = '<div class="autoalt-spinner"></div>';
  } else if (type === "success") {
    iconHTML = '<span class="autoalt-toast-icon">✅</span>';
  } else if (type === "error") {
    iconHTML = '<span class="autoalt-toast-icon">⚠️</span>';
  }

  toast.innerHTML = `${iconHTML}<span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  if (type !== "loading") {
    toastTimer = setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}
