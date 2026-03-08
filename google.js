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
  // 1. Process normal links and grids
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
      // Find a atomic container for the individual result (fixes missing badges on grids)
      const container = link.closest('.g, .uEierd, .pla-unit, .sh-dgr__grid-result, .cu-container');
      
      // If we found a strict individual container and it already has our badge, skip it (prevents mini-link dupes)
      if (container && container.querySelector('.repsol-google-badge')) {
        return;
      }

      // Clean up the text: remove "de saldo" to make it shorter and cleaner
      let rawText = match.cashbackMessage || (match.cashbackPercentage ? `${match.cashbackPercentage}%` : '✨');
      let discountText = rawText.replace(/ de saldo/gi, '').trim();

      const badge = document.createElement('span');
      badge.className = 'repsol-google-badge';
      badge.title = 'Repsol Beneficio!';
      
      const iconUrl = chrome.runtime.getURL('icons/extension16.png');
      badge.innerHTML = `<img src="${iconUrl}" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;display:inline-block;border-radius:2px;"><span class="repsol-badge-text" dir="ltr">${discountText}</span>`;
      
      // Inject logic: Look for headings explicitly (H3 for normal, div[role="heading"] for sponsored)
      const targetAnchor = link.querySelector('h3, div[role="heading"]');
      
      if (targetAnchor) {
        // Insert right after the text inside the heading
        targetAnchor.appendChild(badge);
      } else if (container) {
        // Fallback for product cards where the link contains the store name or price
        const storeNameOrPrice = link.querySelector('.mnpnne, .vnlHbd') || link.querySelector('span[dir="ltr"]');
        if (storeNameOrPrice) {
           storeNameOrPrice.parentElement.appendChild(badge);
        } else {
           link.appendChild(badge);
        }
      } else {
        link.appendChild(badge);
      }
    }
  });

  // 2. Process Google's sidebar Product Viewer (which uses JS instead of a[href] links)
  const textMerchants = document.querySelectorAll('span.WJMUdc:not(.repsol-processed), span.bNg8Rb:not(.repsol-processed), div.sh-osd__merchant-name:not(.repsol-processed)');
  textMerchants.forEach(span => {
    span.classList.add('repsol-processed');
    
    const domainInfo = { raw: span.textContent.toLowerCase(), clean: cleanString(span.textContent) };
    const match = checkMatch(domainInfo, benefitsList);
    
    if (match) {
      if (span.parentElement.querySelector('.repsol-google-badge')) return;
      
      let rawText = match.cashbackMessage || (match.cashbackPercentage ? `${match.cashbackPercentage}%` : '✨');
      let discountText = rawText.replace(/ de saldo/gi, '').trim();

      const badge = document.createElement('span');
      badge.className = 'repsol-google-badge';
      badge.title = 'Repsol Beneficio!';
      const iconUrl = chrome.runtime.getURL('icons/extension16.png');
      badge.innerHTML = `<img src="${iconUrl}" style="width:14px;height:14px;vertical-align:middle;margin-right:2px;display:inline-block;border-radius:2px;"><span class="repsol-badge-text" dir="ltr">${discountText}</span>`;
      
      span.parentElement.appendChild(badge);
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
