// google.js
// Runs on google search results pages

function cleanString(str) {
  if (!str) return "";
  // Keeps lowercase, basic latin letters and numbers
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function getCleanDomain(urlStr) {
  try {
    const url = new URL(urlStr);
    let baseDomain = url.hostname.replace(/^www\./, '');
    const parts = baseDomain.split('.');
    return {
      raw: url.hostname.toLowerCase(),
      clean: cleanString(parts[0])
    };
  } catch(e) {
    return null;
  }
}

function checkMatch(domainInfo, benefitsList) {
  if (!domainInfo) return null;
  for (let benefit of benefitsList) {
    const cleanBrandObj = cleanString(benefit.name);
    if (domainInfo.clean === cleanBrandObj) {
      return benefit;
    }
    if (cleanBrandObj.includes(domainInfo.clean) && domainInfo.clean.length > 3) {
      return benefit;
    }
  }
  return null;
}

function injectGoogleBadges(benefitsList) {
  // Select all links that we haven't processed yet
  const links = document.querySelectorAll('a[href]:not(.repsol-processed)');
  
  links.forEach(link => {
    link.classList.add('repsol-processed');
    let url = link.href;
    
    // Ignore internal Google links
    if (url.includes('google.com/search') || url.includes('google.es/search') || url.startsWith('javascript:')) return;
    
    // Handle sponsored Ads redirect URLs
    if (url.includes('googleadservices.com') || url.includes('/url?')) {
      try {
         const urlObj = new URL(url);
         // Sponsored ads usually put the destination in 'adurl' or 'q'
         url = urlObj.searchParams.get('adurl') || urlObj.searchParams.get('url') || urlObj.searchParams.get('q') || url;
      } catch(e) {}
    }

    const domainInfo = getCleanDomain(url);
    if (!domainInfo || domainInfo.raw.includes('google')) return;

    const match = checkMatch(domainInfo, benefitsList);
    
    if (match) {
      const badge = document.createElement('span');
      badge.className = 'repsol-google-badge';
      badge.title = 'Repsol Beneficio!';
      
      const discountText = match.cashbackMessage || (match.cashbackPercentage ? `${match.cashbackPercentage}%` : '✨');
      const iconUrl = chrome.runtime.getURL('icons/extension16.png');
      badge.innerHTML = `<img src="${iconUrl}" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;display:inline-block;border-radius:2px;"><span class="repsol-badge-text">${discountText}</span>`;
      
      // Inject logic: Look for headings or citations to place it neatly
      const targetAnchor = link.querySelector('h3, div[role="heading"], cite, span.VuuXrf');
      
      if (targetAnchor && targetAnchor.parentElement) {
        targetAnchor.parentElement.appendChild(badge);
      } else {
        // Fallback: just append to the end of the link's contents
        link.appendChild(badge);
      }
    }
  });
}

// Ensure it runs dynamically and observer changes (Google loads results dynamically sometimes)
chrome.storage.local.get(['repsolBenefits'], (res) => {
  if (res.repsolBenefits && res.repsolBenefits.length > 0) {
    
    // Initial run
    injectGoogleBadges(res.repsolBenefits);
    
    // Set up a MutationObserver to catch "Show more results" or dynamic loading
    const observer = new MutationObserver(() => {
        injectGoogleBadges(res.repsolBenefits);
    });
    
    const searchContainer = document.getElementById('search') || document.body;
    if (searchContainer) {
        observer.observe(searchContainer, { childList: true, subtree: true });
    }
  }
});
