const BUTTON_CLASS = "autoalt-button";
const TOAST_CLASS = "autoalt-toast";

// Scanners for typical input/textarea elements for Alt descriptions in Squarespace
const ALT_INPUT_SELECTORS = [
  'input[name="altText"]',
  'textarea[name="altText"]',
  'input[name="fileName"]',
  'input[placeholder*="Alt text"]',
  'input[placeholder*="Alt Text"]',
  'input[placeholder*="Describe this image"]'
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
      // Avoid injecting multiple buttons next to the same field
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

      // Inject the button right after the input field in the DOM
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
      throw new Error("No image preview found in this editor pane.");
    }

    showToast("Analyzing Squarespace asset...", "loading");

    const imageDataUrl = await imageElementToDataUrl(image);
    showToast("Generating alt description...", "loading");

    const result = await chrome.runtime.sendMessage({
      type: "AUTOALT_GENERATE_ALT",
      imageDataUrl
    });

    if (!result?.ok) {
      throw new Error(result?.error || "AutoAlt could not generate a description.");
    }

    showToast("Applying to settings...", "loading");
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
  // Look in the closest editor box, drawer, or modal dialog
  const container = 
    input.closest('.sqs-sidebar') || 
    input.closest('.sqs-modal-box') || 
    input.closest('.sqs-lightbox') ||
    input.closest('form') ||
    document.body;

  // Search inside the container for image elements
  const images = [...container.querySelectorAll('img')];
  if (images.length === 0) return null;

  // Filter images to find one that looks like a high-resolution canvas preview or static asset
  const preview = images.find(img => {
    const src = img.src || "";
    // Avoid loading tracking pixels, icons, or small avatar circles
    const rect = img.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) return false;
    
    return src.includes("squarespace.com") || src.includes("static1.squarespace.com") || src.startsWith("blob:") || src.startsWith("data:");
  });

  // Fallback to the largest image if no matches are discovered
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

  // Squarespace images sometimes have sizing parameters at the end (e.g. ?format=300w)
  // Let's strip format constraints or fetch the direct image
  const response = await fetch(image.src);
  if (!response.ok) {
    throw new Error("Could not read Squarespace image content (CORS or network error).");
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
  // Use React/Angular custom descriptor to override DOM values and trigger framework hooks
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
