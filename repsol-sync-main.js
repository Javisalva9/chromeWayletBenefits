console.log("Repsol Benefits Alert: MAIN world script loaded natively!");

// Intercept the Response.json() used by the browser to parse the API data
const originalJson = window.Response.prototype.json;
window.Response.prototype.json = function() {
  return originalJson.apply(this, arguments).then(data => {
    try {
      // Look for the specific structure we care about
      if (data && data.benefits && Array.isArray(data.benefits)) {
        console.log("Repsol Benefits Alert: CAUGHT data in Response.json!", data.benefits.length);
        window.postMessage({ type: 'REPSOL_BENEFITS_INTERCEPTED', data: data }, '*');
      }
    } catch(e) {}
    return data; // Always return data so the site keeps working
  });
};

// Fallback: Intercept JSON.parse() just in case they parse text manually
const originalParse = JSON.parse;
JSON.parse = function(text, reviver) {
    const data = originalParse(text, reviver);
    try {
        if (data && data.benefits && Array.isArray(data.benefits)) {
            console.log("Repsol Benefits Alert: CAUGHT data in JSON.parse!", data.benefits.length);
            window.postMessage({ type: 'REPSOL_BENEFITS_INTERCEPTED', data: data }, '*');
        }
    } catch(e) {}
    return data;
};
