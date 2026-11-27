import { t, translate } from "./i18n.js";
import { setupSiteTools } from "./site-tools.js";

const widget = document.querySelector("nyx-assistant");
const view = widget.shadowRoot;
view.querySelector(".chat").part.add("chat");
view.querySelector(".controls").part.add("controls");
const language = document.querySelector("#language");
language.part.add("language");
view.querySelector(".disconnect").before(language);
view.querySelector("header h2").part.add("title");
const voicePreference = document.querySelector("#voice-preference");
voicePreference.setAttribute("part", "voice-preference");
const connect = view.querySelector(".connect");
connect.before(voicePreference);
const syncPreference = () => { voicePreference.hidden = connect.hidden; };
new MutationObserver(syncPreference).observe(connect, { attributes: true, attributeFilter: ["hidden"] });
syncPreference();

const micHelp = document.querySelector("#mic-help");
micHelp.setAttribute("part", "mic-help");
const callSettings = view.querySelector(".voice-settings");
callSettings.after(micHelp);
const syncMicHelp = () => { micHelp.hidden = callSettings.hidden; };
new MutationObserver(syncMicHelp).observe(callSettings, { attributes: true, attributeFilter: ["hidden"] });
syncMicHelp();

const toolbar = document.querySelector("#page-tools").content.firstElementChild.cloneNode(true);
const attach = toolbar.querySelector(".attach");
const remove = toolbar.querySelector(".remove");
const feedback = toolbar.querySelector(".excerpt-status");
const composer = view.querySelector("form");
composer.before(toolbar);
const revokeSiteTools = setupSiteTools(widget, toolbar);
const dialog = document.querySelector("#preview");
const excerpt = document.querySelector("#excerpt");
let preview;
let removeTool;
let status;
let boundHost;

function render() {
  translate(toolbar);
  translate(voicePreference);
  micHelp.textContent = t("micTitle");
  view.querySelector(".connect-hint").textContent = t("connectHint");
  feedback.textContent = status ? t(status) : "";
  if (preview) {
    dialog.querySelector("h2").textContent = t(preview.title) + (preview.truncated ? t("truncated") : "");
  }
}
window.addEventListener("nyx-panel-language", render);

function clearExcerpt() {
  removeTool?.();
  removeTool = undefined;
  remove.hidden = true;
  status = undefined;
  excerpt.value = "";
  preview = undefined;
  if (dialog.open) dialog.close("cancel");
  render();
}
function syncHost() {
  if (boundHost !== widget.host) {
    clearExcerpt();
    revokeSiteTools();
    boundHost = widget.host;
  }
  toolbar.hidden = !widget.host;
}
widget.addEventListener("nyx-state", syncHost);
syncHost();
render();

remove.onclick = clearExcerpt;
attach.onclick = async () => {
  const host = widget.host;
  if (!host) return;
  attach.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw Error();
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [0] }, world: "ISOLATED", func: collectPageExcerpt,
    });
    if (widget.host !== host) return;
    const page = frame?.result;
    if (!page) {
      status = "emptyPage";
      return;
    }
    preview = { host, title: page.selection ? "previewSelection" : "previewText", truncated: page.truncated };
    excerpt.value = [page.title, page.text].filter(Boolean).join("\n\n");
    dialog.returnValue = "cancel";
    dialog.showModal();
  } catch {
    if (widget.host === host) status = "grantTab";
  } finally {
    render();
    attach.disabled = false;
  }
};
dialog.addEventListener("close", () => {
  const text = excerpt.value.trim();
  const host = preview?.host;
  preview = undefined;
  excerpt.value = "";
  if (dialog.returnValue !== "share" || !text || !host || widget.host !== host) return;
  removeTool?.();
  removeTool = host.registerTool({
    name: "read_shared_page", description: t("excerptTool"), parameters: widget.z.object({}),
    execute: () => ({ ok: true, value: { excerpt: text } }),
  });
  remove.hidden = false;
  status = "shared";
  render();
  view.querySelector("textarea").focus();
});
