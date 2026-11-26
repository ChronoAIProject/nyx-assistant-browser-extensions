// Keep readers in the same section when they change language.
const language = document.querySelector(".lang");
function syncSection() {
  language.hash = location.hash;
}
syncSection();
window.addEventListener("hashchange", syncSection);

if (navigator.clipboard) {
  for (const button of document.querySelectorAll("[data-copy]")) {
    button.hidden = false;
    const label = button.textContent;
    const target = document.getElementById(button.dataset.copy);
    let reset;
    button.addEventListener("click", async () => {
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText(target.textContent);
        button.textContent = button.dataset.done;
      } catch {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = button.dataset.error;
      }
      reset = setTimeout(() => { button.textContent = label; }, 2000);
    });
  }
}
