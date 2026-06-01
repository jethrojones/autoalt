const BUTTON_CLASS = "autoalt-button";
const TOAST_CLASS = "autoalt-toast";
const COMPOSER_SELECTORS = [
  '[data-testid="tweetTextarea_0"]',
  '[data-testid^="tweetTextarea"]',
  '[contenteditable="true"][role="textbox"]'
];

// MutationObserver to watch for newly rendered elements in the viewport
const observer = new MutationObserver(() => {
  // Use requestAnimationFrame to defer DOM queries and batch element discovery
  requestAnimationFrame(() => {
    injectButtons();
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Initial trigger
requestAnimationFrame(() => {
  injectButtons();
});

async function injectButtons() {
  const textboxes = document.querySelectorAll(COMPOSER_SELECTORS.join(","));
  const BATCH_SIZE = 10;

  for (let i = 0; i < textboxes.length; i += BATCH_SIZE) {
    const batch = Array.from(textboxes).slice(i, i + BATCH_SIZE);
    
    batch.forEach((textbox) => {
      const composer = findComposer(textbox);
      if (!composer || composer.querySelector(`.${BUTTON_CLASS}`)) {
        return;
      }

      const toolbar = findToolbar(composer, textbox);
      if (!toolbar) {
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = BUTTON_CLASS;
      button.innerHTML = `<span>✨</span><span>AutoAlt</span>`;
      button.title = "Generate descriptive alt text for this image automatically";
      button.addEventListener("click", () => handleGenerate(composer, button));
      
      // Inject next to X's default media upload indicators or at the end of the bar
      toolbar.appendChild(button);
    });

    if (globalThis.scheduler?.yield) {
      await scheduler.yield();
    }
  }
}

function findComposer(textbox) {
  return (
    textbox.closest('[role="dialog"]') ||
    textbox.closest('[data-testid="cellInnerDiv"]') ||
    textbox.closest("article") ||
    textbox.closest("form") ||
    textbox.parentElement
  );
}

function findToolbar(composer, textbox) {
  return (
    composer.querySelector('[data-testid="toolBar"]') ||
    composer.querySelector('[role="toolbar"]') ||
    textbox.closest("div")?.parentElement
  );
}

async function handleGenerate(composer, button) {
  // Save button's initial state
  const originalHTML = button.innerHTML;
  
  try {
    button.disabled = true;
    button.innerHTML = `<span>⚡</span><span>Writing...</span>`;

    const image = findPreviewImage(composer);
    if (!image) {
      throw new Error("Add an image to this post before running AutoAlt.");
    }

    showToast("Analyzing image elements...", "loading");

    const imageDataUrl = await imageElementToDataUrl(image);
    showToast("Generating alt description...", "loading");
    
    const result = await chrome.runtime.sendMessage({
      type: "AUTOALT_GENERATE_ALT",
      imageDataUrl
    });

    if (!result?.ok) {
      throw new Error(result?.error || "AutoAlt could not generate a description.");
    }

    showToast("Applying to composer...", "loading");
    await applyAltText(composer, result.altText);
    showToast("Alt description successfully added!", "success");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

function findPreviewImage(composer) {
  const selectors = [
    '[data-testid="attachments"] img',
    'img[src^="blob:"]',
    'img[src^="data:image/"]',
    'img[src*="pbs.twimg.com/media"]'
  ];

  const images = [...composer.querySelectorAll(selectors.join(","))];
  return images.find((image) => {
    const rect = image.getBoundingClientRect();
    return rect.width >= 80 && rect.height >= 80;
  });
}

async function imageElementToDataUrl(image) {
  if (image.src.startsWith("data:image/")) {
    return image.src;
  }

  const response = await fetch(image.src);
  if (!response.ok) {
    throw new Error("AutoAlt could not read the uploaded image preview.");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("The selected upload preview is not an image.");
  }

  if (blob.size > 20 * 1024 * 1024) {
    throw new Error("This image is too large for the current AutoAlt extension limit.");
  }

  return blobToDataUrl(blob);
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("AutoAlt could not prepare the image."));
    reader.readAsDataURL(blob);
  });
}

async function applyAltText(composer, altText) {
  const trigger = findButtonByText(composer, [
    "Add description",
    "Edit description",
    "ALT",
    "Alt"
  ]);

  if (!trigger) {
    throw new Error("AutoAlt could not find X's alt description control for this image.");
  }

  trigger.click();
  await waitFor(() => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    return dialog.querySelector("textarea");
  });

  const dialog = document.querySelector('[role="dialog"]') || document.body;
  const textarea = dialog.querySelector("textarea");
  setNativeValue(textarea, altText);

  const save = findButtonByText(dialog, ["Save", "Done", "Apply"]);
  if (!save) {
    throw new Error("AutoAlt wrote the description but could not find X's save button.");
  }

  save.click();
}

function findButtonByText(root, labels) {
  const wanted = labels.map((label) => label.toLowerCase());
  return [...root.querySelectorAll('button, [role="button"]')].find((button) => {
    if (button.classList?.contains(BUTTON_CLASS)) {
      return false;
    }

    const text = (button.textContent || button.getAttribute("aria-label") || "")
      .trim()
      .toLowerCase();
    return wanted.some((label) => text === label || (label.length > 3 && text.includes(label)));
  });
}

function setNativeValue(element, value) {
  const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

function waitFor(callback, timeoutMs = 4000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const value = callback();
      if (value) {
        resolve(value);
        return;
      }

      if (Date.now() - started > timeoutMs) {
        reject(new Error("Timed out waiting for X's alt text dialog."));
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
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

  // Trigger browser paint to allow sliding transitions
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
