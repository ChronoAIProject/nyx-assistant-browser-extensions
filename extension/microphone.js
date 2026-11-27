import { t } from "./i18n.js";

const button = document.querySelector("#allow-mic");
const status = document.querySelector("#mic-status");
let message;

function render() {
  document.title = t("micTitle");
  status.textContent = message ? t(message) : "";
}
button.onclick = async () => {
  button.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getTracks()) track.stop();
    message = "micReady";
    button.hidden = true;
  } catch (error) {
    message = error.name === "NotAllowedError" ? "micDenied" : "micDevice";
  } finally {
    button.disabled = false;
    render();
  }
};
window.addEventListener("nyx-panel-language", render);
render();
