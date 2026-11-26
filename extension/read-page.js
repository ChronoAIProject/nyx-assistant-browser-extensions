// Chrome serializes this function into the isolated world of the top frame.
// It has no arguments, external dependencies or page-side effects.
function collectPageExcerpt() {
  if (!["http:", "https:"].includes(location.protocol) || !document.body) return null;
  const excluded = 'input,textarea,select,option,[contenteditable]:not([contenteditable="false"]),[role="textbox"],script,style,template,noscript,iframe,object,embed,[hidden],[inert],[aria-hidden="true"]';
  if (document.designMode === "on" || document.body.closest(excluded)) return null;
  const selection = document.getSelection();
  const range = selection?.rangeCount && !selection.isCollapsed ? selection.getRangeAt(0) : null;
  // A selection within an editor must never fall back to reading a whole page.
  if (document.activeElement?.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')) return null;
  const limit = 12000;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (range && !range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches(excluded)) return NodeFilter.FILTER_REJECT;
        const style = getComputedStyle(node);
        if (style.display === "none" || style.opacity === "0" || style.contentVisibility === "hidden" ||
            style.webkitTextSecurity && style.webkitTextSecurity !== "none") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_SKIP;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let text = "";
  for (let node = walker.nextNode(); node && text.length <= limit; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || getComputedStyle(parent).visibility !== "visible") continue;
    const visible = document.createRange();
    visible.selectNodeContents(node);
    if (!visible.getClientRects().length) continue;
    const start = range?.startContainer === node ? range.startOffset : 0;
    const end = range?.endContainer === node ? range.endOffset : node.length;
    const part = node.substringData(start, Math.min(end - start, limit + 1)).replace(/\s+/g, " ").trim();
    if (part) text += (text ? "\n" : "") + part;
  }
  if (!text) return null;
  return { title: document.title.slice(0, 160), selection: Boolean(range), text: text.slice(0, limit), truncated: text.length > limit };
}
