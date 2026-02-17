# 📖 AI Chat Book

> Your personal archive, analytics dashboard, and organizer for all your AI conversations — ChatGPT and Claude supported.

![AI Chat Book Dashboard](https://img.shields.io/badge/React-v18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-v5-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-00f5d4?style=flat-square)
![Privacy](https://img.shields.io/badge/privacy-100%25%20local-06d6a0?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **Chat Viewer** | Read full conversations with styled message bubbles |
| 📊 **Analytics Dashboard** | Activity heatmaps, model usage charts, monthly trends |
| 🔍 **Smart Filters** | Filter by date, platform, model, tags, message count |
| 🏷️ **Tagging** | Add custom color-coded tags to any conversation |
| 🔗 **Links** | Attach file URLs and references to conversations |
| 📝 **Notes** | Write personal notes on any chat |
| 📤 **Export** | Download as CSV or JSON — all or filtered |
| 🔒 **Private** | 100% local — data never leaves your browser |
| 📦 **ZIP Support** | Import ChatGPT's .zip export directly |

---

## 🚀 Quick Start

### Option 1 — Run Locally (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-chat-book.git
cd ai-chat-book

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Option 2 — GitHub Pages (Static Hosting)

```bash
# Build for production
npm run build

# Deploy to GitHub Pages (using gh-pages package)
npm install -g gh-pages
gh-pages -d dist
```

Or use the included GitHub Actions workflow (see `.github/workflows/deploy.yml`).

---

## 📂 How to Import Your Data

### ChatGPT Export
1. Go to [chat.openai.com](https://chat.openai.com) → **Settings** → **Data Controls**
2. Click **Export Data** → wait for the email
3. Download the `.zip` file — upload it directly to AI Chat Book

### Claude Export  
1. Go to [claude.ai](https://claude.ai) → **Settings** → **Privacy**
2. Click **Export Data** → download `conversations.json`
3. Upload the `.json` file to AI Chat Book

> 💡 You can import from both platforms — conversations are merged and labeled by platform.

---

## 🏗️ Project Structure

```
ai-chat-book/
├── src/
│   ├── components/
│   │   ├── ChatBook/        # Conversation list + full chat viewer
│   │   ├── Dashboard/       # Metrics, charts, heatmap
│   │   ├── Export/          # CSV/JSON export
│   │   ├── Filters/         # Filter sidebar
│   │   ├── Shared/          # Guide + shared UI
│   │   └── Upload/          # Import panel with progress bar
│   ├── hooks/
│   │   ├── useChats.js      # Data store (localStorage)
│   │   └── useFilters.js    # Filter state and logic
│   ├── parsers/
│   │   ├── chatgpt.js       # ChatGPT conversations.json parser
│   │   └── claude.js        # Claude conversations.json parser
│   ├── App.jsx              # Main layout + navigation
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool (fast HMR)
- **Tailwind CSS** — Utility styling
- **Recharts** — Charts and analytics
- **JSZip** — In-browser ZIP extraction
- **Lucide React** — Icons
- **localStorage** — Data persistence (no backend!)

---

## 🎨 Customization

The color theme is defined in `src/index.css` using CSS variables:

```css
:root {
  --bg-primary: #0a0a1a;       /* Main background */
  --accent-cyan: #00f5d4;      /* Primary accent */
  --accent-purple: #b57bee;    /* Secondary accent */
  --accent-amber: #ffbe0b;     /* Highlights */
}
```

---

## 🔒 Privacy

All your conversation data is stored in your browser's **localStorage**. Nothing is uploaded to any server. The app works completely offline once loaded.

> ⚠️ **Tip**: Use the **Export** tab regularly to back up your data as JSON — localStorage can be cleared by your browser.

---

## 📤 Export Formats

| Format | Contents |
|---|---|
| **Conversations CSV** | One row per conversation: title, platform, model, dates, tags, notes |
| **Full JSON** | Complete data including all messages, tags, links, notes |
| **Messages CSV** | One row per message — ideal for data analysis |
| **Stats JSON** | Dashboard metrics and activity summaries |

All exports support **filtered** mode — export only what matches your current filters.

---

## 🤝 Contributing

Pull requests are welcome! Please:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for anyone who wants to take back control of their AI conversation history.

