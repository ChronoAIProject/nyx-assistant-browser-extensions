import { accessPageRegistry, readDescriptors } from "./page-api.js";
import { t } from "./i18n.js";

export function setupSiteTools(widget, toolbar) {
  const dialog = document.querySelector("#api-access");
  const fields = dialog.querySelector("fieldset");
  const enable = dialog.querySelector('[value="enable"]');
  const open = toolbar.querySelector(".apis");
  const disable = toolbar.querySelector(".disable-apis");
  const status = toolbar.querySelector(".api-status");
  const panelWindow = chrome.windows.getCurrent().then(win => win.id);
  let generation = 0;
  let current;
  let message;
  let removers = [];

  function render() {
    status.textContent = message ? t(message) : "";
  }
  function revoke(reason) {
    ++generation;
    for (const remove of removers) remove();
    removers = [];
    current = undefined;
    message = reason;
    disable.hidden = true;
    if (dialog.open) dialog.close("cancel");
    render();
  }
  async function activeTab() {
    const [tab] = await chrome.tabs.query({ active: true, windowId: await panelWindow });
    return tab;
  }
  function execute(target, args) {
    let timer;
    const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(Error()), 15000); });
    return Promise.race([
      chrome.scripting.executeScript({ target, world: "MAIN", func: accessPageRegistry, args }), timeout,
    ]).finally(() => clearTimeout(timer));
  }
  async function invoke(grant, descriptor, args, signal) {
    const failure = key => ({ ok: false, code: key, message: t(key) });
    try {
      const tab = await activeTab();
      if (current !== grant || signal.aborted || widget.host !== grant.host) return failure("apiGone");
      if (tab?.id !== grant.tabId || tab.url !== grant.href) {
        revoke("apiGone");
        return failure("apiGone");
      }
      const [frame] = await execute({ tabId: grant.tabId, documentIds: [grant.documentId] },
        [grant.href, descriptor, args]);
      if (current !== grant || signal.aborted || widget.host !== grant.host) return failure("apiGone");
      if (frame?.documentId !== grant.documentId || frame.frameId !== 0 || frame.result?.error === "apiGone") {
        revoke("apiGone");
        return failure("apiGone");
      }
      const value = frame.result?.value;
      if (typeof value !== "string" || value.length > 32768) throw Error();
      return { ok: true, value: JSON.parse(value) };
    } catch {
      if (current === grant) revoke("apiFailed");
      return failure("apiFailed");
    }
  }

  open.onclick = async () => {
    revoke();
    const ticket = generation;
    const host = widget.host;
    if (!host) return;
    open.disabled = true;
    let error = "grantTab";
    try {
      const tab = await activeTab();
      if (ticket !== generation || widget.host !== host) return;
      if (!/^https?:\/\//.test(tab?.url) || !tab.id) throw Error();
      const grant = { tabId: tab.id, windowId: tab.windowId, host, href: tab.url };
      current = grant;
      const [frame] = await execute({ tabId: tab.id, frameIds: [0] }, [tab.url]);
      if (ticket !== generation || widget.host !== host) return;
      if (!frame?.documentId || frame.frameId !== 0) throw Error();
      grant.documentId = frame.documentId;
      error = ["noApis", "apiGone"].includes(frame.result?.error) ? frame.result.error : "invalidApis";
      const tools = readDescriptors(frame.result?.metadata);
      if (!tools.length) { error = "noApis"; throw Error(); }
      grant.tools = tools;
      fields.replaceChildren();
      for (const tool of tools) {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = tool.name;
        label.append(checkbox, " ", tool.name, " — ", tool.description);
        fields.append(label);
      }
      dialog.querySelector(".origin").textContent = new URL(tab.url).origin;
      enable.disabled = true;
      dialog.returnValue = "cancel";
      dialog.showModal();
    } catch {
      if (ticket === generation) revoke(error);
    } finally {
      open.disabled = false;
    }
  };
  fields.onchange = () => { enable.disabled = !fields.querySelector("input:checked"); };
  dialog.addEventListener("close", async () => {
    const grant = current;
    if (!grant || !grant.tools) return;
    if (dialog.returnValue !== "enable") { revoke(); return; }
    const names = new Set([...fields.querySelectorAll("input:checked")].map(input => input.value));
    try {
      const tab = await activeTab();
      if (current !== grant) return;
      if (!names.size || tab?.id !== grant.tabId || tab.url !== grant.href || widget.host !== grant.host) {
        revoke("apiGone");
        return;
      }
      for (const descriptor of grant.tools.filter(tool => names.has(tool.name))) {
        const shape = {};
        for (const [key, type] of Object.entries(descriptor.parameters)) {
          shape[key] = type === "string" ? widget.z.string().max(2048) : widget.z[type]();
        }
        removers.push(grant.host.registerTool({
          name: "site_" + descriptor.name, description: descriptor.description,
          parameters: widget.z.object(shape), execute: (args, signal) => invoke(grant, descriptor, args, signal),
        }));
      }
      disable.hidden = false;
      message = "apiEnabled";
      render();
    } catch {
      if (current === grant) revoke("apiGone");
    }
  });
  disable.onclick = () => revoke();
  chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
    if (windowId === await panelWindow && (!current || current.tabId !== tabId)) revoke();
  });
  chrome.tabs.onUpdated.addListener((tabId, change) => {
    if (current?.tabId === tabId && (change.status === "loading" || change.url)) revoke("apiGone");
  });
  chrome.tabs.onRemoved.addListener(tabId => { if (current?.tabId === tabId) revoke(); });
  chrome.tabs.onReplaced.addListener((_, removed) => { if (current?.tabId === removed) revoke(); });
  window.addEventListener("pagehide", () => revoke());
  window.addEventListener("nyx-panel-language", render);
  return () => revoke();
}
