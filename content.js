// Function to clean strings for fuzzy matching
function cleanString(str) {
  if (!str) return "";
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

// Function to extract useful hostname without www and TLD (for fuzzy search)
function getCleanHostname() {
  const hostname = window.location.hostname;
  let baseDomain = hostname.replace(/^www\./, '');
  
  // Split by dot and take the biggest word (usually the brand name)
  const parts = baseDomain.split('.');
  
  return {
    raw: hostname.toLowerCase(),
    clean: cleanString(parts[0])
  };
}

// Check database for matches
function findMatch(benefitsList) {
  const domainInfo = getCleanHostname();
  
  for (let benefit of benefitsList) {
    const cleanBrandObj = cleanString(benefit.name);
    
    // Strict domain match check: e.g. "amazon" === "amazon"
    if (domainInfo.clean === cleanBrandObj) {
      return benefit;
    }
    
    // Contains match: If brand name is "amazon electronica", and domain is "amazon"
    if (cleanBrandObj.includes(domainInfo.clean) && domainInfo.clean.length > 3) {
      return benefit;
    }
  }
  return null;
}

// Function to inject the banner
function injectBanner(benefit) {
  // Prevent duplicate banners
  if (document.getElementById('repsol-benefits-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'repsol-benefits-banner';
  
  const discountText = benefit.cashbackMessage || (benefit.cashbackPercentage ? `${benefit.cashbackPercentage}% de saldo` : '¡Beneficio disponible!');

  banner.innerHTML = `
    <div class="repsol-banner-content">
      <div class="repsol-clickable-area" title="Click to open Repsol Area Cliente">
        <div class="repsol-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#FF512F" stroke-width="3"/>
            <path d="M12 7C14.7614 7 17 9.23858 17 12" stroke="#F09819" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="repsol-text-wrapper">
          <span class="repsol-title">Repsol Area Cliente</span>
          <span class="repsol-discount">${discountText} en <strong>${benefit.name}</strong></span>
        </div>
      </div>
      <div class="repsol-actions">
        <button class="repsol-action-btn repsol-mute-btn" title="Mute on this site">🔕</button>
        <button class="repsol-action-btn repsol-close-btn" title="Close">✕</button>
      </div>
    </div>
  `;

  document.body.prepend(banner);

  // Trigger animation after adding to DOM
  setTimeout(() => {
    banner.classList.add('repsol-show');
  }, 100);

  // Clickable link
  const linkArea = banner.querySelector('.repsol-clickable-area');
  linkArea.addEventListener('click', () => {
    window.open('https://areacliente.repsol.es/mis-beneficios/resultados-de-busqueda', '_blank');
  });

  // Close functionality
  const closeBtn = banner.querySelector('.repsol-close-btn');
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    banner.classList.remove('repsol-show');
    setTimeout(() => {
      banner.remove();
    }, 400); // Wait for transition
  });

  // Mute functionality
  const muteBtn = banner.querySelector('.repsol-mute-btn');
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const hostname = window.location.hostname;
    chrome.storage.local.get(['repsolMutedDomains'], (res) => {
      let muted = res.repsolMutedDomains || [];
      if (!muted.includes(hostname)) {
        muted.push(hostname);
        chrome.storage.local.set({ repsolMutedDomains: muted }, () => {
          console.log(`Repsol Benefits Alert: Muted notifications for ${hostname}`);
        });
      }
    });

    banner.classList.remove('repsol-show');
    setTimeout(() => {
      banner.remove();
    }, 400);
  });
}

// On Page Load: Ask background for benefits list and check
chrome.storage.local.get(['repsolBenefits', 'repsolMutedDomains'], (result) => {
  const hostname = window.location.hostname;
  const muted = result.repsolMutedDomains || [];

  if (muted.includes(hostname)) {
    console.log("Repsol Benefits Alert: Domain is muted. Banner won't show.");
    return;
  }

  if (result.repsolBenefits && result.repsolBenefits.length > 0) {
    const match = findMatch(result.repsolBenefits);
    if (match) {
      injectBanner(match);
    }
  }
});
