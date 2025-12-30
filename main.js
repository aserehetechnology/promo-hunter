import './style.css';

const API_URL = '/api';

let promos = [];

// Get country flag emoji
function getCountryFlag(country) {
    const flags = {
        'Global': '🌍',
        'US': '🇺🇸',
        'UK': '🇬🇧',
        'CA': '🇨🇦',
        'AU': '🇦🇺',
        'IN': '🇮🇳',
        'ID': '🇮🇩',
        'SG': '🇸🇬',
        'MY': '🇲🇾'
    };
    return flags[country] || '🌐';
}

// Get category emoji
function getCategoryIcon(category) {
    const icons = {
        'AI Tools': '🤖',
        'Software': '💻',
        'Games': '🎮',
        'Education': '📚',
        'Developer Tools': '⚙️',
        'Design Tools': '🎨',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
}

// Render promo card
function renderPromoCard(promo) {
    const card = document.createElement('div');
    card.className = 'promo-card fade-in';

    card.innerHTML = `
    <div class="promo-header">
      <h3 class="promo-title">${promo.title}</h3>
      <span class="promo-badge">${promo.source}</span>
    </div>
    
    <p class="promo-description">${promo.description || 'No description available'}</p>
    
    <div class="promo-meta">
      <span class="meta-tag">${getCategoryIcon(promo.category)} ${promo.category}</span>
      <span class="meta-tag">${getCountryFlag(promo.country)} ${promo.country}</span>
      ${promo.tags ? promo.tags.split(',').slice(0, 2).map(tag =>
        `<span class="meta-tag">🏷️ ${tag.trim()}</span>`
    ).join('') : ''}
    </div>

    ${promo.promo_code ? `
    <div class="promo-code-container" style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-family: monospace; font-weight: bold; color: var(--accent-tertiary);">Code: ${promo.promo_code}</span>
      <button onclick="navigator.clipboard.writeText('${promo.promo_code}')" style="padding: 2px 8px; font-size: 0.7rem; background: var(--card-bg);">Copy</button>
    </div>` : ''}

    ${promo.instructions ? `
    <div class="promo-instructions" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; border-left: 2px solid var(--accent-primary); padding-left: 0.5rem;">
      <strong style="color: var(--text-secondary);">💡 How to claim:</strong><br/>
      ${promo.instructions}
    </div>` : ''}
    
    <div class="promo-footer">
      <span class="source-badge">
        ⏱️ ${formatDate(promo.created_at)}
      </span>
      <a href="${promo.url}" target="_blank" rel="noopener noreferrer" class="promo-link">
        View Deal →
      </a>
    </div>
  `;

    return card;
}

// Render promos
function renderPromos(promosToRender) {
    const grid = document.getElementById('promo-grid');
    const emptyState = document.getElementById('empty-state');

    grid.innerHTML = '';

    if (promosToRender.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        promosToRender.forEach(promo => {
            grid.appendChild(renderPromoCard(promo));
        });
    }
}

// Fetch promos from API
async function fetchPromos() {
    const category = document.getElementById('category-filter').value;
    const country = document.getElementById('country-filter').value;
    const source = document.getElementById('source-filter').value;
    const search = document.getElementById('search-input').value;

    const params = new URLSearchParams();
    if (category !== 'all') params.append('category', category);
    if (country !== 'all') params.append('country', country);
    if (source !== 'all') params.append('source', source);
    if (search) params.append('search', search);

    try {
        const response = await fetch(`${API_URL}/promos?${params}`);
        if (!response.ok) throw new Error('Failed to fetch promos');

        promos = await response.json();
        renderPromos(promos);
    } catch (error) {
        console.error('Error fetching promos:', error);
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('promo-grid').style.display = 'none';
    }
}

// Fetch stats
async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');

        const stats = await response.json();

        document.getElementById('total-promos').textContent = stats.total;
        document.getElementById('new-today').textContent = stats.last24h;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Trigger scraping
async function triggerScraping() {
    const scrapeBtn = document.getElementById('scrape-btn');
    const originalText = scrapeBtn.innerHTML;

    scrapeBtn.disabled = true;
    scrapeBtn.innerHTML = '<span>⏳</span><span>Scraping...</span>';

    try {
        const response = await fetch(`${API_URL}/scrape`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to trigger scraping');

        // Wait a bit for scrapers to collect data
        setTimeout(() => {
            fetchPromos();
            fetchStats();
            scrapeBtn.disabled = false;
            scrapeBtn.innerHTML = originalText;
        }, 5000);
    } catch (error) {
        console.error('Error triggering scraping:', error);
        scrapeBtn.disabled = false;
        scrapeBtn.innerHTML = originalText;
        alert('Failed to trigger scraping. Make sure the server is running!');
    }
}

// Event listeners
document.getElementById('category-filter').addEventListener('change', fetchPromos);
document.getElementById('country-filter').addEventListener('change', fetchPromos);
document.getElementById('source-filter').addEventListener('change', fetchPromos);

let searchTimeout;
document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchPromos, 500);
});

document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchPromos();
    fetchStats();
});

document.getElementById('scrape-btn').addEventListener('click', triggerScraping);

// Show loading initially
document.getElementById('loading').style.display = 'block';

// Initial load
async function init() {
    await fetchStats();
    await fetchPromos();
    document.getElementById('loading').style.display = 'none';
}

init();

// Auto-refresh every 5 minutes
setInterval(() => {
    fetchPromos();
    fetchStats();
}, 5 * 60 * 1000);
