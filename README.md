# Bliss and Innocence

A modern portfolio website for the Bliss and Innocence music label, built with **Astro**.

## 🎵 Project Overview

This is a monorepo project containing the official website for the Bliss and Innocence music label. The site showcases the label's artists and releases.

## 🛠 Tech Stack

- **Astro** (v7.2.4) - Modern static site generator
- **Node.js** >= 22.12.0
- **YAML** - Content configuration
- **npm workspaces** - Monorepo management

## 📁 Project Structure

```
blissandinnocence/
├── apps/
│   └── website/          # Main Astro website application
├── packages/             # Shared packages (if any)
├── package.json          # Root workspace configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v22.12.0 or higher
- npm v10 or higher

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The site will be available at `http://localhost:3000` (or as shown in the terminal).

### Building

```bash
# Build for production
npm run build
```

The build process includes content validation before generating static assets.

### Preview

```bash
# Preview the production build locally
npm run preview
```

## 📝 Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Validate content and build for production
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests (currently not configured)

## 🌐 Features

- **Static Site Generation** - Fast, secure, and SEO-friendly
- **Sitemap Generation** - Automatic XML sitemaps for search engines
- **Content Validation** - Automated validation of content before deployment
- **Responsive Design** - Mobile-friendly portfolio

## 📦 Dependencies

### Production
- `astro` - Web framework for building content-focused websites
- `@astrojs/sitemap` - Automatic sitemap generation
- `yaml` - YAML parser for configuration files

### Development
- `@types/node` - TypeScript type definitions for Node.js

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

ISC License - See LICENSE file for details

## 👤 Author

Created by Himada

---

**Built with ❤️ using Astro**
