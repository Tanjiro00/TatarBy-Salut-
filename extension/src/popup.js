// src/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('pill0');
  const toggle1 = document.getElementById('pill1');


  // Check if the extension is enabled or disabled
  chrome.storage.sync.get(['isEnabled'], (result) => {
    toggle.checked = result.isEnabled === undefined? false : result.isEnabled;
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

  chrome.storage.sync.get(['isEnabled1'], (result) => {
    toggle1.checked = result.isEnabled1 === undefined? false : result.isEnabled1;
  });

  // Listen for changes to the toggle
  toggle1.addEventListener('change', () => {
    const isEnabled1 = toggle1.checked;

    // Save the toggle state
    chrome.storage.sync.set({ isEnabled1 }, () => {
      console.log(`The speaker mode is ${isEnabled1? 'enabled' : 'disabled'}.`);
      
      // Send a message to the content script to enable/disable the extension
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'setIsEnabled1', isEnabled1 });
      });
    });
  });
});
