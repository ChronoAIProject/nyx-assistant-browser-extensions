// Configure the element before the SDK upgrades it and restores a saved grant.
const assistant = document.querySelector("nyx-assistant");
const voicePreference = document.querySelector("#include-voice");
voicePreference.checked = localStorage.getItem("nyx-include-voice") !== "false";
if (!voicePreference.checked) {
  // The 0.3.0 text grant is scoped to this endpoint and existing-key profile.
  assistant.dataset.voice = "false";
  assistant.dataset.nyxid = "https://nyx-api.chrono-ai.fun";
  assistant.dataset.keySource = "existing";
}
voicePreference.onchange = () => {
  localStorage.setItem("nyx-include-voice", String(voicePreference.checked));
  location.reload();
};
