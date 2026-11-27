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
const review = toolbar.querySelector(".review");
const remove = toolbar.querySelector(".remove");
const source = toolbar.querySelector(".shared-source");
const feedback = toolbar.querySelector(".excerpt-status");
const composer = view.querySelector("form");
composer.before(toolbar);
const revokeSiteTools = setupSiteTools(widget, toolbar);
const dialog = document.querySelector("#preview");
const excerpt = document.querySelector("#excerpt");
const panelWindow = chrome.windows.getCurrent().then(win => win.id);
let shared;
let preview;
let status;
let boundHost;
let unregister;
let generation = 0;

function render() {
  translate(toolbar);
  translate(voicePreference);
  micHelp.textContent = t("micTitle");
  view.querySelector(".connect-hint").textContent = t("connectHint");
  feedback.textContent = status ? t(status) : "";
  remove.hidden = !shared;
  source.hidden = !shared;
  source.textContent = shared ? [t(shared.selection ? "sharedSelection" : "sharedPage"), shared.title,
    shared.truncated ? t("truncated").trim() : ""].filter(Boolean).join(" · ") : "";
  if (preview) {
    dialog.querySelector("h2").textContent = t(preview.selection ? "previewSelection" : "previewText") +
      (preview.truncated ? t("truncated") : "");
  }
}
window.addEventListener("nyx-panel-language", render);

function clearExcerpt() {
  ++generation;
  shared = undefined;
  status = undefined;
  preview = undefined;
  excerpt.value = "";
  if (dialog.open) dialog.close("cancel");
  render();
}
function syncHost() {
  if (boundHost !== widget.host) {
    unregister?.();
    clearExcerpt();
    revokeSiteTools();
    boundHost = widget.host;
    // A realtime session captures tool bindings at dial time. Keep this binding
    // for the host's lifetime and resolve the user's current snapshot on each call.
    unregister = boundHost?.registerTool({
      name: "read_shared_page", description: t("excerptTool"), parameters: widget.z.object({}),
      execute: () => shared ? { ok: true, value: { excerpt: shared.text } }
        : { ok: false, code: "no_shared_page", message: t("noSharedPage") },
    });
  }
  toolbar.hidden = !widget.host;
}
widget.addEventListener("nyx-state", syncHost);
syncHost();
render();

function share(page, text) {
  shared = { title: page.title, selection: page.selection, truncated: page.truncated, text };
  status = undefined;
  render();
}
async function readPage(withPreview) {
  if (!widget.host) return;
  const request = ++generation;
  attach.disabled = review.disabled = true;
  try {
    const query = { active: true, windowId: await panelWindow };
    const [tab] = await chrome.tabs.query(query);
    if (!tab?.id || !/^https?:\/\//.test(tab.url)) throw Error();
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId: tab.id, frameIds: [0] }, world: "ISOLATED", func: collectPageExcerpt,
    });
    const [current] = await chrome.tabs.query(query);
    if (request !== generation) return;
    if (current?.id !== tab.id || current.url !== tab.url) {
      status = "pageChanged";
      return;
    }
    const page = frame?.result;
    if (!page) {
      status = "emptyPage";
      return;
    }
    const text = [page.title, page.text].filter(Boolean).join("\n\n");
    if (withPreview) {
      preview = page;
      excerpt.value = text;
      dialog.returnValue = "cancel";
      dialog.showModal();
    } else {
      share(page, text);
    }
  } catch {
    if (request === generation) status = "grantTab";
  } finally {
    attach.disabled = review.disabled = false;
    render();
  }
}
attach.onclick = () => readPage(false);
review.onclick = () => readPage(true);
remove.onclick = clearExcerpt;
dialog.querySelector("form").addEventListener("submit", event => {
  const text = excerpt.value.trim();
  if (event.submitter?.value === "share" && preview && text) share(preview, text);
});
dialog.addEventListener("close", () => {
  if (dialog.open) return;
  preview = undefined;
  excerpt.value = "";
});
