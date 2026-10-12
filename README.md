# Pro Webcam Studio 📷✨

A modern, high-definition webcam web application built from scratch with native browser APIs. Take photos, record videos, apply real-time color filters, and manage media locally with zero server uploads.

![Pro Webcam Studio](https://img.shields.io/badge/Privacy-100%25%20In--Browser-brightgreen)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JS%20%7C%20Vite-blue)

---

## 🌟 Features

- **Live Camera Control**: Select any connected webcam/camera device, with front/rear camera flip for mobile.
- **Photo Capture**: Capture high-resolution still photos with realistic mechanical shutter sound and screen flash.
- **Video Recording**: Record video with MediaRecorder, pause/resume/stop, with live timer and status indicators.
- **Creative Controls**: 8 real-time visual filter presets (B&W Film, Sepia, Cyberpunk, Golden Glow, etc.) plus fine-tuning sliders for Digital Zoom, Brightness, Contrast, and Saturation.
- **Composition Grids**: Rule of Thirds (3×3), Golden Ratio, Center Crosshairs, and Square (1:1) framing.
- **Local Gallery**: Persistent storage using IndexedDB. Preview in full-screen Lightbox, download media, copy photos to clipboard, and batch clear.
- **100% Privacy**: No cloud backend, zero server transmission. Everything runs locally inside your browser.
- **Keyboard Shortcuts**: Hotkeys for rapid shooting (`Space`, `R`, `P`, `M`, `G`, `F`, `C`, `B`, `Esc`).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Enter the project folder
cd Webcam

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173/` and click **"Start Camera"**.

### Production Build
```bash
npm run build
```
The compiled static assets will be ready in the `dist/` directory.

---

## 🔒 Privacy Guarantee
This application does not collect, transmit, or store any camera footage, photos, or recordings on any remote server. All data stays strictly in your browser's private local storage.
