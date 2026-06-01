const form = document.getElementById("options-form");
const apiKey = document.getElementById("api-key");
const model = document.getElementById("model");
const status = document.getElementById("status");

chrome.storage.local.get({ apiKey: "", model: "gpt-5-mini" }, (settings) => {
  apiKey.value = settings.apiKey;
  model.value = settings.model;
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  chrome.storage.local.set(
    {
      apiKey: apiKey.value.trim(),
      model: model.value.trim() || "gpt-5-mini"
    },
    () => {
      status.textContent = "Settings saved.";
      window.setTimeout(() => {
        status.textContent = "";
      }, 2500);
    }
  );
});
