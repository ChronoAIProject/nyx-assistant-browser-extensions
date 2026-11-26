// Chrome has already opened the panel. Use the bundled widget's existing
// launcher so it also sets focus and updates the expanded state.
const widget = document.querySelector("nyx-assistant");
const view = widget.shadowRoot;
view.querySelector(".chat").part.add("chat");
view.querySelector(".controls").part.add("controls");
view.querySelector(".connect-hint").textContent =
  "连接 NyxID 即可开始对话。要讨论正在浏览的内容，可以复制网页上的文字，粘贴到消息中。";
view.querySelector('[part="launcher"]').click();
