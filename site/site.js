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

document.getElementById("api-snippet").textContent = document.getElementById("live-example").textContent.trim();
const runApi = document.getElementById("run-api");
runApi.onclick = async () => {
  const output = document.getElementById("api-output");
  runApi.disabled = true;
  try {
    output.textContent = JSON.stringify(await window.nyxPageAPI.tools[0].execute({ details: true }), null, 2);
  } catch (error) {
    output.textContent = String(error.message);
  } finally {
    runApi.disabled = false;
  }
};
