import { fallbackBenefits } from './fallbackData.js';

// Initialize the extension when it's installed or updated
chrome.runtime.onInstalled.addListener(() => {
  // Check if we already have benefits saved
  chrome.storage.local.get(['repsolBenefits', 'lastSync'], (result) => {
    if (!result.repsolBenefits || result.repsolBenefits.length === 0) {
      // If none, load the fallback data
      chrome.storage.local.set({ 
        repsolBenefits: fallbackBenefits,
        lastSync: new Date().toISOString(),
        isFallbackData: true
      });
      console.log('Repsol Benefits Alert: Loaded fallback data.', fallbackBenefits.length, 'brands saved.');
    }
  });
});

// Optional: listen for messages from content scripts if they need to fetch something specific via background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_BENEFITS') {
    // When repsol-sync.js sends new data
    chrome.storage.local.set({
      repsolBenefits: message.benefits,
      lastSync: new Date().toISOString(),
      isFallbackData: false
    }, () => {
      console.log('Repsol Benefits Alert: Successfully synced new data.', message.benefits.length, 'brands saved.');
    });
    sendResponse({ success: true });
  }
});
