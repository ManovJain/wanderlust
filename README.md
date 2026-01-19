# 🌍 Wanderlust

An interactive 3D globe travel bucket list application built with Next.js, D3.js, and TypeScript. Track destinations you've visited and places you want to visit on a beautiful, interactive globe visualization.

![Wanderlust Globe](https://img.shields.io/badge/Status-Active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- **Interactive 3D Globe**: Rotate, zoom, and explore the world with a smooth orthographic projection
- **40+ Curated Destinations**: Pre-loaded with popular tourist destinations across all continents
- **Travel Tracking**: Mark destinations as "Visited" or add them to your "Wishlist"
- **Country Colors**: Beautiful colored dots representing different countries
- **Search & Filter**: Find destinations by name, filter by category (Cities, Nature, Landmarks, Beaches, Adventure), or filter by status
- **Travel Statistics**: Track your progress with stats showing visited, wishlist, and unexplored destinations
- **Persistent Storage**: Your travel data is saved locally in your browser
- **Performance Optimized**: Smooth 60fps rendering with adaptive dot density

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wanderlust.git
cd wanderlust
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Visualization**: [D3.js](https://d3js.org/) with GeoJSON
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Maps**: World Atlas TopoJSON

## 📁 Project Structure

```
wanderlust/
├── app/
│   ├── components/
│   │   ├── GlobeMap.tsx          # Main 3D globe component
│   │   ├── TravelDashboard.tsx   # Sidebar with stats and filters
│   │   └── ...
│   ├── data/
│   │   └── destinations.ts       # Destination data
│   └── page.tsx                  # Main page
├── public/                       # Static assets
└── package.json
```

## 🎨 Features in Detail

### Interactive Globe
- Drag to rotate
- Scroll to zoom
- Hover over countries to see names
- Click pins to see destination details
- Toggle pins on/off for better performance

### Destination Management
- **Visited**: Mark places you've been to (green pins)
- **Wishlist**: Add places you want to visit (orange pins)
- **Unexplored**: Discover new destinations (colored by category)

### Categories
- 🏙️ Cities
- 🏔️ Nature
- 🏛️ Landmarks
- 🏖️ Beaches
- 🎿 Adventure

## 🚢 Deployment

### Build for Production

```bash
pnpm build
pnpm start
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wanderlust)

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- World map data from [World Atlas](https://github.com/topojson/world-atlas)
- Country data from [ISO-3166-Countries](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes)
- Inspired by Vercel's Black Friday visualization style

---

Made with ❤️ for travelers and explorers
