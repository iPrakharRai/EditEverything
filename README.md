# EditEverything (EE) 🌊

> **The All-in-One, Free, Private & Lightning-Fast Online PDF and Image Editor Suite**

![EditEverything Banner](https://img.shields.io/badge/EditEverything-PDF%20%26%20Image%20Suite-00e5ff?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-0891b2?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-cyan?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## ✨ Overview

**EditEverything** is an intuitive, privacy-first web application designed to handle all your PDF and Image editing needs directly inside your browser. No files are ever uploaded to external servers—all optical character recognition (OCR), text editing, page manipulation, document signing, and rendering happen 100% client-side with zero data tracking.

Designed with a modern electric cyan-and-teal aesthetic, intuitive floating bubble toolbars, and a subtle animated flowing water backdrop, EditEverything provides a desktop-class editing experience on the web.

---

## 🚀 Key Features

### 🔍 1. AI OCR Text Editor (Images & Scanned PDFs)
- **Instant Optical Character Recognition**: Powered by client-side WebAssembly Tesseract.js.
- **In-Place Text Editing**: Detects text bounding boxes, original typography, alignment, and background colors.
- **Smart Inpainting**: Erases existing text seamlessly and replaces it with edited text matching the original position, font size, and color.
- **Dual Export Options**: Download edited documents directly as high-resolution PNG/JPG images or convert them directly into searchable, printable vector PDFs.

### 📝 2. Full-Featured PDF Editor
- **Direct Text Editing & Addition**: Click anywhere to edit existing text or type new rich text blocks with custom fonts, colors, line spacing, and alignments.
- **Interactive Forms & Fields**: Insert text boxes, checkmarks, checkboxes, and radio fields directly onto documents.
- **Signatures & Initialization**: Draw electronic signatures, type calligraphic signatures, or upload signature image files.
- **Annotations & Drawing**: Freehand pencil, smooth highlighter, sticky notes, and callouts.
- **Shapes & Redaction**: Add rectangles, ellipses, arrows, divider lines, and whiteout/redaction blocks to redact sensitive details.
- **Image Insertion**: Embed PNG, JPEG, and SVG logos or stamps onto any page with full rotation and scaling controls.

### 🛠️ 3. Comprehensive PDF Tool Suite
- **Compress PDF**: Optimize and shrink large PDF file sizes while retaining optimal reading clarity.
- **Merge PDF**: Combine multiple PDFs into a single unified document with drag-and-drop page reordering.
- **Split PDF**: Extract page ranges or burst large documents into individual standalone files.
- **Delete & Reorder Pages**: Visual page organizer to rotate, duplicate, or delete unwanted pages.
- **Rotate PDF**: Rotate individual pages or whole documents 90°, 180°, or 270°.
- **Watermark PDF**: Apply custom diagonal or horizontal text watermarks with opacity and scale controls.
- **Page Numbers**: Add customized page numbering (Top/Bottom, Left/Center/Right, format styles).
- **Protect & Unlock**: Secure documents with encryption or unlock password-protected files.
- **Crop PDF**: Trim margins and adjust visible canvas boundaries visually.

---

## 🎨 Design & User Experience

- **Flowing Water Background**: Dynamic, refractive animated water surface with floating micro-bubbles that flow across the application.
- **Cyan & Teal Color Scheme**: Consistent sampled palette (`#00e5ff`, `#00bed6`, `#0891b2`) for a crisp, calming, and focused editing environment.
- **Floating Contextual Bubble Toolbar**: Appears directly above selected elements (text, signatures, shapes) for rapid styling without cluttering your workspace.
- **Portal-Rendered Modals**: Pricing, desktop downloader, and settings modals render above all stacking contexts with zero viewport clipping.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 5](https://vitejs.dev/) |
| **Styling & Icons** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **PDF Engine** | [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist (PDF.js)](https://mozilla.github.io/pdf.js/) |
| **OCR Engine** | [Tesseract.js](https://tesseract.projectnaptha.com/) (WebAssembly client-side engine) |
| **Archive Utilities** | [JSZip](https://stuk.github.io/jszip/) |
| **Optional Python Tools** | Python 3.12+, Pillow, PyPDF, ReportLab, Pytesseract (see `requirements.txt`) |

---

## 📦 Project Structure

```
EditEverything/
├── public/                 # Static public assets, icons, and samples
├── scripts/                # Development scripts and automation helpers
│   └── unify_ocr_editor.py # OCR editor unification helper
├── src/
│   ├── components/         # Global layout and reusable UI components
│   │   ├── FileDropzone.tsx    # Drag-and-drop file upload with sample loaders
│   │   ├── Footer.tsx          # Global footer with navigation and legal links
│   │   ├── Hero.tsx            # Main header and quick-action hub
│   │   ├── HowToGuide.tsx      # Step-by-step guides for PDF & image tools
│   │   ├── Navbar.tsx          # Top navigation with dropdowns and modal portals
│   │   ├── ToolGrid.tsx        # Categorized grid of all 40+ PDF/image tools
│   │   └── WaterBackground.tsx # Refractive flowing water and bubble animations
│   ├── data/
│   │   └── tools.ts            # Tool definitions, categories, and route metadata
│   ├── tools/              # Specialized tool interfaces
│   │   ├── CompressPdf.tsx
│   │   ├── ConvertTools.tsx
│   │   ├── DeletePages.tsx
│   │   ├── FillSign.tsx
│   │   ├── ImageTextEditor.tsx # In-place OCR image text editor
│   │   ├── MergePdf.tsx
│   │   ├── OrganizeAndSecurity.tsx
│   │   ├── PageNumbers.tsx
│   │   ├── PdfEditor.tsx       # Core editor with floating toolbar & canvas
│   │   ├── ProtectUnlock.tsx
│   │   ├── RotatePdf.tsx
│   │   ├── SplitPdf.tsx
│   │   └── WatermarkPdf.tsx
│   ├── utils/              # Document manipulation & sample generation
│   │   ├── pdfProcessor.ts
│   │   ├── sampleImages.ts     # In-memory realistic sample images for OCR testing
│   │   └── samplePdfs.ts       # In-memory sample contracts and invoices
│   ├── App.tsx             # Root application coordinator and tool switcher
│   ├── index.css           # Tailwind directives and custom animation keyframes
│   ├── main.tsx            # React application entrypoint
│   └── types.ts            # Global TypeScript interfaces
├── .gitignore              # Git ignore rules for Node, Python, and build outputs
├── index.html              # HTML shell
├── package.json            # Node dependencies and build scripts
├── requirements.txt        # Optional Python dependencies for backend/script utilities
├── tailwind.config.js      # Tailwind configuration and color palette tokens
├── tsconfig.json           # TypeScript compiler configuration
└── vite.config.ts          # Vite configuration
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** (or **pnpm** / **yarn**)

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd EditEverything
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the URL shown in your terminal).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The compiled, optimized output will be written to the `dist/` directory, ready to deploy to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

---

## 🐍 Optional Python Tooling

If you run external Python batch processing scripts or offline OCR utilities located in `scripts/`:

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 🔒 Privacy & Security

- **Zero Cloud Uploads**: Documents and images are processed strictly in client memory using Web Workers and WebAssembly.
- **No Third-Party Analytics / Tracking**: Your sensitive files, financial records, and confidential contracts never leave your machine.
- **Client-Side Sandbox**: Built to ensure that refreshing or closing the tab immediately clears in-memory document buffers.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
