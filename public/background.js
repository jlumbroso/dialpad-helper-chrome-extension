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

// Function to add an element to the local storage dictionary
function addElement(id, data) {
  if (data !== null && data.hasOwnProperty('url') && (data.url === undefined || data.url === null || typeof data.url !== 'string')) {
    console.log(`Element with ID ${id} has no URL, removing from the dictionary.`);
    delete data.url;
  }
  chrome.storage.local.get('dialpadCallDictionary', (result) => {
    const dictionary = result.dialpadCallDictionary || {};
    if (dictionary.hasOwnProperty(id)) {
      console.log(`Element with ID ${id} already exists in the dictionary, updating instead.`, data);
      return updateElement(id, data);
    }
    dictionary[id] = data;
    chrome.storage.local.set({ dialpadCallDictionary: dictionary }, () => {
      console.log(`Element with ID ${id} added to the dictionary.`, data);
    });
  });
}

// Function to update an element in the local storage dictionary
function updateElement(id, data) {
  if (data !== null && data.hasOwnProperty('url') && (data.url === undefined || data.url === null || typeof data.url !== 'string')) {
    console.log(`Element with ID ${id} has no URL, removing from the dictionary.`);
    delete data.url;
  }
  chrome.storage.local.get('dialpadCallDictionary', (result) => {
    const dictionary = result.dialpadCallDictionary || {};
    if (dictionary.hasOwnProperty(id)) {
      dictionary[id] = { ...dictionary[id], ...data };
      chrome.storage.local.set({ dialpadCallDictionary: dictionary }, () => {
        console.log(`Element with ID ${id} updated in the dictionary.`, data);
      });
    } else {
      console.log(`Element with ID ${id} not found in the dictionary.`);
    }
  });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'addElement') {
    const { id, data } = message;
    addElement(id, data);
    sendResponse({ success: true });
  } else if (message.type === 'updateElement') {
    const { id, data } = message;
    updateElement(id, data);
    sendResponse({ success: true });
  }
});