chrome.runtime.onInstalled.addListener(() => {
  // Create a context menu item
  // See: https://developer.chrome.com/docs/extensions/reference/api/contextMenus#method-create
  chrome.contextMenus.create({
    id: "runInfoCollection",
    title: "Collect Call Information",
    contexts: ["selection"],
  });

});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "runInfoCollection") {
    // Send a message to the content script
    chrome.tabs.sendMessage(tab.id, { action: "collectCallInformation" });
  }
});
