// Handling the toolbar gesture here lets Chrome grant activeTab before opening
// the panel. Clear the native action override saved by earlier versions.
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
});
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});
