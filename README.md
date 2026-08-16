# Nathaniel (Nate) K. Mina — Jekyll-Inspired Developer Portfolio & Bio Hub

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)

A dark-theme, Jekyll-inspired interactive **Link in Bio**, **Interactive CV / Resume**, and **Engineering Portfolio Hub** built for **Nathaniel (Nate) K. Mina** (@Dom-I-NATE) — CEO & Founder of Pure Computers, Systems Architect, Mechanical & Marine IT Engineer.

---

## 🌟 Key Features

### 1. 🔗 Link in Bio & Social Hub
- **Direct Access**: Curated links to active projects, GitHub repos, LinkedIn, Instagram, TikTok, Reddit, Threads, Facebook, Pinterest, and personal blogs.
- **Dynamic Link QR Generator**: Instant QR code generator for any individual link with 1-click SVG download and quick copy.
- **Copy Link Feedback**: Toast notifications and clipboard integration for sharing.

### 2. 📄 Interactive CV / Resume
- **Comprehensive Experience**: Professional track record spanning Pure Computers, Marine IT Network infrastructure, fiber optic deployments, and automation systems.
- **Certifications & Education**: Google / Coursera verified credentials with direct verification links.
- **Categorized Skills**: Hardware engineering, systems architecture, Linux server management, thermal design, network infrastructure, and full-stack development.
- **1-Click Print & PDF Export**: Clean, high-contrast print stylesheet ready for professional resume exporting.

### 3. 🖥️ Pure Computers Enterprise Page
- **Company Overview**: Services, enterprise IT solutions, custom workstation builds, and network architecture.
- **Service Inquiry Portal**: Interactive quote and inquiry form for custom PC builds, diagnostics, network infrastructure, and high-performance compute clusters.

### 4. 🚀 Portfolio & Deployed Works (Interactive Simulations)
- **Pull House Heat to Pool (ThermalCore v5.0)**: Integrated residential heat recovery suite with interactive COP efficiency metrics, live simulation, and system telemetry.
- **VitalStats Clinical Supplement Portal**: Multi-parameter biomarker tracking and telemetry analytics dashboard.
- **Live Embed Preview**: Side-by-side or modal iframe preview for hosted HTML tools and prototypes.

### 5. ⚡ Industrial Wattage & Thermal Cost Calculator
- **Component Matrix**: Real-time wattage and annual electric cost calculator for custom rigs, server racks, and compute nodes.
- **Efficiency & PUE Modeling**: Customizable electricity rates ($/kWh), daily runtimes, and PSU efficiency curve presets.

### 6. 💻 Interactive Unix Terminal Emulator (`~`)
- **CLI Commands**: Type `help`, `bio`, `skills`, `projects`, `contact`, `theme [midnight|dracula|chirpy|cayman|hacker]`, `clear`, `curl`, `calc`, and more.
- **Keyboard Shortcuts**: Open anytime with `Ctrl + ~` or via the top terminal button.

### 7. 📸 High-Resolution Photo Gallery & Lightbox
- **Interactive Lightbox**: Full-screen photo carousel featuring verified portraits and hardware engineering showcase pictures.
- **Thumbnail Strip & Autoplay**: Smooth navigation with auto-rotation, keyboard arrow support (`←` / `→` / `Esc`), and multi-tier asset resolution fallbacks.

### 8. 🎨 5 Jekyll-Inspired Dark Themes
- **Midnight Terminal** (Emerald on Navy-Slate)
- **Dracula Dark** (Cyberpunk Magenta & Purple)
- **Chirpy Minimal** (Sapphire on Graphite)
- **Cayman Dark** (Teal & Classic GitHub Pages)
- **Hacker Matrix** (Obsidian Canvas with Matrix Green)

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) with `@tailwindcss/vite`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **Backend / API**: [Express](https://expressjs.com/) (Node.js)

---

## 📁 Project Structure

```text
├── public/
│   ├── images/                     # Static public image assets & fallbacks
│   ├── pull-house-heat-to-pool.html# Standalone ThermalCore v5.0 interactive simulation
│   └── supplement_portal.html      # Standalone VitalStats telemetry portal
├── src/
│   ├── assets/
│   │   └── images/                 # Master bundled profile & gallery images
│   ├── components/
│   │   ├── BioLinks.tsx            # Main link-in-bio & social links view
│   │   ├── CvResume.tsx            # Interactive CV / Resume & print exporter
│   │   ├── Footer.tsx              # Terminal status & copyright footer
│   │   ├── Header.tsx              # Brand header, theme switcher & nav tabs
│   │   ├── PhotoCarouselModal.tsx  # High-res photo gallery modal
│   │   ├── PortfolioWorksPage.tsx  # Deployed projects & live iframe previewer
│   │   ├── PureComputersPage.tsx   # Enterprise services & inquiry portal
│   │   ├── QrCodeModal.tsx         # Vector QR code generator modal
│   │   ├── SystemCalculator.tsx    # Power & thermal cost calculator
│   │   └── TerminalModal.tsx       # Interactive CLI terminal emulator
│   ├── data/
│   │   └── profileData.ts          # Centralized profile data, links, skills & themes
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces and type definitions
│   ├── utils/
│   │   ├── imageUtils.ts           # Multi-tiered image resolution & error handler
│   │   └── qrGenerator.ts          # Pure-canvas vector QR code algorithm
│   ├── App.tsx                     # Top-level state & tab router
│   ├── index.css                   # Tailwind v4 import & custom styles
│   └── main.tsx                    # React application entry point
├── package.json                    # Project dependencies & build scripts
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nate-Mina/react-example.git
   cd react-example
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 📦 Build & Production

To compile static assets for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The compiled output will be generated in the `dist/` directory, ready for deployment to any static host (GitHub Pages, Cloudflare Pages, Vercel, Netlify, AWS S3, etc.).

---

## 🌐 Deploying to GitHub Pages

1. In `vite.config.ts`, ensure `base` matches your repository name (or `./` for relative paths):
   ```typescript
   export default defineConfig({
     base: './',
     plugins: [react(), tailwindcss()],
   });
   ```

2. Deploy using `gh-pages` or a GitHub Actions workflow targeting the `dist` directory.

---

## ⚙️ Customization

All personal information, social links, case studies, and projects are centralized in `src/data/profileData.ts`.

- **Update Bio & Profile**: Modify `profileData.name`, `profileData.bio`, `profileData.title`, etc.
- **Add / Edit Links**: Add items to the `profileData.links` array.
- **Add Projects**: Add entries into `profileData.portfolioWorks` or add standalone interactive HTML files into `public/`.
- **Add Photos**: Drop photos into `src/assets/images/` and register them in `profileData.galleryPhotos`.

---

## 👤 Author

**Nathaniel (Nate) K. Mina**
- **Company**: [Pure Computers](https://www.PureComp.Net)
- **Profile Hub**: [beacons.ai/p_c/aboutme](https://beacons.ai/p_c/aboutme)
- **GitHub**: [@Nate-Mina](https://github.com/Nate-Mina)
- **LinkedIn**: [linkedin.com/in/dom-i-nate](https://linkedin.com/in/dom-i-nate)
- **Email**: `Furtheraptitudes@gmail.com`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
