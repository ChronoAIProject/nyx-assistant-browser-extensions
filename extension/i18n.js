// Chrome localizes the manifest. The panel can also use an explicit user preference.
const locales = { en: "en", "zh-CN": "zh_CN" };
const key = "nyx-panel-language";
const catalogs = Object.fromEntries(await Promise.all(Object.entries(locales).map(async ([tag, folder]) => {
  const response = await fetch(chrome.runtime.getURL(`_locales/${folder}/messages.json`));
  if (!response.ok) throw Error("Missing locale: " + tag);
  return [tag, await response.json()];
})));

const picker = document.querySelector("#language");
let current;
export function t(id) { return catalogs[current][id].message; }
export function translate(root) {
  for (const el of root.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
}
function apply() {
  const saved = localStorage.getItem(key);
  const preference = Object.hasOwn(locales, saved) ? saved : "auto";
  current = preference === "auto" ? chrome.i18n.getMessage("localeTag") : preference;
  if (!Object.hasOwn(locales, current)) current = "en";
  document.documentElement.lang = current;
  document.title = t("extensionName");
  if (picker) {
    picker.value = preference;
    picker.setAttribute("aria-label", t("language"));
    translate(picker);
  }
  const widget = document.querySelector("nyx-assistant");
  if (widget) widget.lang = current;
  translate(document);
  window.dispatchEvent(new Event("nyx-panel-language"));
}
picker?.addEventListener("change", () => {
  if (picker.value === "auto") localStorage.removeItem(key);
  else localStorage.setItem(key, picker.value);
  apply();
});
window.addEventListener("storage", event => { if (event.key === key || event.key === null) apply(); });
apply();
