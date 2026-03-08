console.log("Repsol Benefits Alert: ISOLATED world script loaded!");

// Listen for messages emitted from the MAIN world content script
window.addEventListener('message', (event) => {
  if (event.source === window && event.data && event.data.type === 'REPSOL_BENEFITS_INTERCEPTED') {
    const data = event.data.data;
    if (data && data.benefits && Array.isArray(data.benefits)) {
      console.log("Repsol Benefits Alert: Forwarding " + data.benefits.length + " benefits to background worker!");
      
      // Use chrome runtime to actually save it to the extension
      chrome.runtime.sendMessage({
        type: 'SYNC_BENEFITS',
        benefits: data.benefits
      });
    }
  }
});
