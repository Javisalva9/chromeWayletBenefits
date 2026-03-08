document.addEventListener('DOMContentLoaded', () => {
  const brandsCountEl = document.getElementById('brands-count');
  const syncDateEl = document.getElementById('sync-date');
  const syncBtn = document.getElementById('sync-btn');
  const statusDot = document.querySelector('.status-dot');
  
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const resultsList = document.getElementById('results-list');

  let allBenefits = [];

  // Function to clean string for search
  function cleanString(str) {
    if (!str) return "";
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Load initial data
  chrome.storage.local.get(['repsolBenefits', 'lastSync', 'isFallbackData'], (result) => {
    if (result.repsolBenefits) {
      allBenefits = result.repsolBenefits;
      brandsCountEl.textContent = allBenefits.length;
    }
    
    if (result.lastSync) {
      const date = new Date(result.lastSync);
      syncDateEl.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    if (result.isFallbackData) {
      // If it's the hardcoded dummy data, make dot orange to prompt sync
      statusDot.style.backgroundColor = '#ffc107';
      statusDot.style.boxShadow = '0 0 8px #ffc107';
      document.getElementById('sync-status').textContent = 'Using Default Data';
    }
  });

  // Handle Search
  searchInput.addEventListener('input', (e) => {
    const query = cleanString(e.target.value).trim();
    
    if (query === '') {
      searchResults.classList.add('hidden');
      return;
    }

    const filtered = allBenefits.filter(b => cleanString(b.name).includes(query));
    
    resultsList.innerHTML = ''; // clear previous
    if (filtered.length > 0) {
      searchResults.classList.remove('hidden');
      filtered.forEach(b => {
        const li = document.createElement('li');
        const discountText = b.cashbackMessage || (b.cashbackPercentage ? `${b.cashbackPercentage}%` : 'Beneficio');
        li.innerHTML = `
          <span class="result-name">${b.name}</span>
          <span class="result-discount">${discountText}</span>
        `;
        resultsList.appendChild(li);
      });
    } else {
      searchResults.classList.remove('hidden');
      const li = document.createElement('li');
      li.innerHTML = '<span class="result-name" style="color:#8b949e">No matches found</span>';
      resultsList.appendChild(li);
    }
  });

  // Handle Sync Button Click
  syncBtn.addEventListener('click', () => {
    syncBtn.classList.add('syncing');
    
    // Instead of waiting for the background page to scrape, we could trigger a new tab
    // or tell the user to visit Repsol Area Cliente.
    chrome.tabs.create({ url: 'https://areacliente.repsol.es/mis-beneficios/resultados-de-busqueda' }, () => {
      setTimeout(() => {
        syncBtn.classList.remove('syncing');
      }, 1000);
    });
  });
});
