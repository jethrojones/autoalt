document.addEventListener("DOMContentLoaded", async () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".panel");

  const form = document.getElementById("settings-form");
  const providerSelect = document.getElementById("provider");
  const geminiKeyGroup = document.getElementById("gemini-key-group");
  const openaiKeyGroup = document.getElementById("openai-key-group");
  const geminiApiKey = document.getElementById("gemini-api-key");
  const openaiApiKey = document.getElementById("openai-api-key");
  const styleInputs = document.querySelectorAll('input[name="style"]');
  const customPromptGroup = document.getElementById("custom-prompt-group");
  const customPrompt = document.getElementById("custom-prompt");
  const statusMsg = document.getElementById("status");

  const btnTestKey = document.getElementById("btn-test-key");
  const testStatus = document.getElementById("test-status");

  const historyList = document.getElementById("history-list");
  const btnClearHistory = document.getElementById("btn-clear-history");

  // --- Password Visiblity Toggles ---
  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
      } else {
        input.type = "password";
        button.textContent = "👁️";
      }
    });
  });

  // --- Tab Routing System ---
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPanel = document.getElementById(tab.id.replace("tab-", "panel-"));
      if (targetPanel) {
        targetPanel.classList.add("active");
      }

      if (tab.id === "tab-history") {
        loadHistory();
      }
    });
  });

  // --- Dynamic Form Visibility ---
  function updateFormVisibility() {
    const provider = providerSelect.value;
    if (provider === "gemini") {
      geminiKeyGroup.classList.remove("d-none");
      openaiKeyGroup.classList.add("d-none");
    } else {
      geminiKeyGroup.classList.add("d-none");
      openaiKeyGroup.classList.remove("d-none");
    }

    const selectedStyle = document.querySelector('input[name="style"]:checked')?.value;
    if (selectedStyle === "custom") {
      customPromptGroup.classList.remove("d-none");
    } else {
      customPromptGroup.classList.add("d-none");
    }
  }

  providerSelect.addEventListener("change", updateFormVisibility);
  styleInputs.forEach(input => input.addEventListener("change", updateFormVisibility));

  // --- Load Settings ---
  const settings = await chrome.storage.local.get({
    provider: "gemini",
    apiKey: "",
    geminiApiKey: "",
    style: "concise",
    customPrompt: ""
  });

  providerSelect.value = settings.provider;
  openaiApiKey.value = settings.apiKey;
  geminiApiKey.value = settings.geminiApiKey;
  customPrompt.value = settings.customPrompt;

  styleInputs.forEach(input => {
    if (input.value === settings.style) {
      input.checked = true;
    }
  });

  updateFormVisibility();

  // --- Save Settings ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const provider = providerSelect.value;
    const style = document.querySelector('input[name="style"]:checked')?.value || "concise";

    await chrome.storage.local.set({
      provider,
      apiKey: openaiApiKey.value.trim(),
      geminiApiKey: geminiApiKey.value.trim(),
      style,
      customPrompt: customPrompt.value.trim()
    });

    statusMsg.textContent = "Settings Saved!";
    statusMsg.className = "status-message success";
    
    setTimeout(() => {
      statusMsg.textContent = "";
    }, 2000);
  });

  // --- Test API Key Connection ---
  btnTestKey.addEventListener("click", async () => {
    const provider = providerSelect.value;
    const key = provider === "gemini" ? geminiApiKey.value.trim() : openaiApiKey.value.trim();

    if (!key) {
      testStatus.textContent = "⚠️ Enter key first.";
      testStatus.className = "test-feedback error";
      return;
    }

    btnTestKey.disabled = true;
    testStatus.textContent = "Testing...";
    testStatus.className = "test-feedback";

    try {
      const response = await chrome.runtime.sendMessage({
        type: "AUTOALT_TEST_API",
        provider,
        apiKey: key
      });

      if (response?.ok) {
        testStatus.textContent = "✅ Connected!";
        testStatus.className = "test-feedback success";
      } else {
        throw new Error(response?.error || "Connection failed.");
      }
    } catch (err) {
      testStatus.textContent = `❌ ${err.message}`;
      testStatus.className = "test-feedback error";
    } finally {
      btnTestKey.disabled = false;
    }
  });

  // --- History Log Operations ---
  async function loadHistory() {
    const { history = [] } = await chrome.storage.local.get("history");
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = '<p class="empty-state">No alt descriptions generated yet.</p>';
      return;
    }

    history.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "history-item";
      
      const textEl = document.createElement("p");
      textEl.className = "history-text";
      textEl.textContent = item;
      itemEl.appendChild(textEl);

      const metaEl = document.createElement("div");
      metaEl.className = "history-meta";

      const copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-secondary btn-text";
      copyBtn.style.padding = "2px 8px";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(item);
        copyBtn.textContent = "Copied!";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 1500);
      });

      metaEl.appendChild(copyBtn);
      itemEl.appendChild(metaEl);
      historyList.appendChild(itemEl);
    });
  }

  btnClearHistory.addEventListener("click", async () => {
    await chrome.storage.local.remove("history");
    loadHistory();
  });
});
