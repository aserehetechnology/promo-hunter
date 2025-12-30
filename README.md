# 🎯 Promo Hunter

**Real-time Promo Aggregator** - Discover free software, AI tools, games, and educational resources from around the world!

## ✨ Features

- 🔍 **Real-time Web Scraping** - Automatically crawls Reddit, Product Hunt, and GitHub
- 🌍 **Global Coverage** - Filter by country (US, UK, Canada, India, Indonesia, etc.)
- 🤖 **Smart Categorization** - AI Tools, Software, Games, Education, and more
- ⚡ **Auto-refresh** - Server scrapes new promos every 30 minutes
- 🎨 **Premium UI** - Modern dark theme with smooth animations
- 📊 **Live Statistics** - Track total promos and daily updates

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

You need to run TWO terminals:

#### Terminal 1 - Backend Server (API + Scrapers)
```bash
npm run server
```
This starts the Express server on `http://localhost:3001` and begins scraping.

#### Terminal 2 - Frontend Dev Server
```bash
npm run dev
```
This starts the Vite dev server, usually on `http://localhost:5173`

### First Time Setup

1. Start the backend server first (`npm run server`)
2. Wait 10-20 seconds for initial scraping to complete
3. Start the frontend (`npm run dev`)
4. Open your browser to the URL shown (usually `http://localhost:5173`)

## 📂 Project Structure

```
promo-hunter/
├── server.js              # Express API server
├── scrapers/
│   ├── reddit.js         # Reddit scraper (r/freebies, r/eFreebies, etc.)
│   ├── producthunt.js    # Product Hunt scraper
│   └── github.js         # GitHub scraper (awesome lists)
├── main.js               # Frontend JavaScript
├── style.css             # Premium UI styles
├── index.html            # HTML structure
└── promos.db             # SQLite database (auto-created)
```

## 🔧 API Endpoints

- `GET /api/promos` - Get all promos (supports filters)
  - Query params: `category`, `country`, `source`, `search`
- `GET /api/stats` - Get statistics
- `POST /api/scrape` - Trigger manual scraping
- `DELETE /api/promos` - Clear all promos

## 🎨 Categories

- 🤖 AI Tools
- 💻 Software
- 🎮 Games
- 📚 Education
- ⚙️ Developer Tools
- 🎨 Design Tools
- 📦 Other

## 🌍 Supported Countries

- 🌍 Global
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇦🇺 Australia
- 🇮🇳 India
- 🇮🇩 Indonesia
- 🇸🇬 Singapore
- 🇲🇾 Malaysia

## 🔍 Data Sources

1. **Reddit** - Multiple subreddits including:
   - r/freebies
   - r/eFreebies
   - r/FreeGameFindings
   - r/DealsReddit

2. **Product Hunt** - Trending products and tools

3. **GitHub** - Curated lists:
   - free-for-dev
   - open-source-mac-os-apps
   - awesome lists
   - GitHub Education Pack

## ⚙️ Configuration

### Auto-scraping Interval
Edit `server.js` line ~135:
```javascript
setInterval(() => {
  runScrapers();
}, 30 * 60 * 1000); // Change 30 to your desired minutes
```

### Rate Limiting
Scrapers include built-in rate limiting to respect source websites. See individual scraper files in `scrapers/` folder.

## 🛠️ Troubleshooting

### "Failed to fetch promos"
- Make sure the backend server is running (`npm run server`)
- Check that port 3001 is not in use

### "No promos found"
- Click "Scrape Now" button to trigger manual scraping
- Check backend console for scraping errors
- Some sources may be temporarily unavailable

### Frontend not loading
- Make sure both servers are running
- Try clearing browser cache
- Check browser console for errors

## 📝 TODO / Future Enhancements

- [ ] Add more data sources (AppSumo, Indie Hackers)
- [ ] Implement user favorites/bookmarks
- [ ] Add expiry date tracking
- [ ] Email notifications for new promos
- [ ] Browser extension
- [ ] Mobile app

## 🤝 Contributing

Pull requests welcome! Feel free to add more scrapers or improve existing ones.

## ⚖️ Legal Notice

This tool is for educational purposes. Please respect the terms of service of scraped websites and use responsibly.

## 📄 License

MIT License - feel free to use and modify!

---

Made with ❤️ for deal hunters worldwide 🌍
