// src/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('pill0');

  // Check if the extension is enabled or disabled
  chrome.storage.sync.get(['isEnabled'], (result) => {
    toggle.checked = result.isEnabled === undefined? true : result.isEnabled;
  });

  // Listen for changes to the toggle
  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;

    // Save the toggle state
    chrome.storage.sync.set({ isEnabled }, () => {
      console.log(`The extension is ${isEnabled? 'enabled' : 'disabled'}.`);
      
      // Send a message to the content script to enable/disable the extension
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'setIsEnabled', isEnabled });
      });
    });
  });
});
