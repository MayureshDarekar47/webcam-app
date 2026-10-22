/**
 * Snapchat-Style Lens & Video Filters Engine
 * Real-time Video Filters, Color Grading, Digital Zoom & Lens Effects
 */

export const FILTER_CATEGORIES = [
  { id: 'all', name: 'For You', icon: '👻' },
  { id: 'trending', name: 'Trending', icon: '🔥' },
  { id: 'aesthetic', name: 'Beauty', icon: '💄' },
  { id: 'funny', name: 'Animals', icon: '🐾' },
  { id: 'retro', name: 'Retro', icon: '📼' },
  { id: 'neon', name: 'Wild', icon: '🌀' },
  { id: 'cinematic', name: 'Cinematic', icon: '🎬' }
];

export const FILTER_PRESETS = [
  {
    id: 'none',
    name: 'Original',
    category: 'all',
    icon: '📷',
    tagline: 'Clean natural HD camera',
    gradient: 'linear-gradient(135deg, #334155 0%, #64748b 100%)',
    css: '',
    overlay: null
  },
  {
    id: 'dog-ears',
    name: 'Puppy Dog',
    category: 'funny',
    icon: '🐶',
    tagline: 'Classic floppy dog ears & tongue',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    css: 'brightness(106%) saturate(120%) contrast(105%)',
    overlay: 'dog-ears'
  },
  {
    id: 'flower-crown',
    name: 'Flower Crown',
    category: 'aesthetic',
    icon: '🌸',
    tagline: 'Coachella blooming floral glow',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
    css: 'brightness(112%) contrast(102%) saturate(135%) sepia(15%)',
    overlay: 'flower-crown'
  },
  {
    id: 'butterflies',
    name: 'Gold Butterflies',
    category: 'aesthetic',
    icon: '🦋',
    tagline: 'Floating glowing 3D butterflies',
    gradient: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
    css: 'brightness(110%) contrast(105%) saturate(145%) sepia(20%)',
    overlay: 'butterflies'
  },
  {
    id: 'cute-bear',
    name: 'Teddy Bear',
    category: 'funny',
    icon: '🐻',
    tagline: 'Cute fuzzy bear ears & blush',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
    css: 'brightness(108%) saturate(125%) contrast(98%)',
    overlay: 'cute-bear'
  },
  {
    id: 'neon-horns',
    name: 'Neon Horns',
    category: 'neon',
    icon: '😈',
    tagline: 'Electric violet devil glow',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    css: 'contrast(135%) saturate(175%) hue-rotate(280deg)',
    overlay: 'neon-horns'
  },
  {
    id: 'angel-halo',
    name: 'Angel Halo',
    category: 'aesthetic',
    icon: '😇',
    tagline: 'Golden glowing ring of light',
    gradient: 'linear-gradient(135deg, #fde047 0%, #eab308 100%)',
    css: 'brightness(115%) contrast(106%) saturate(130%) sepia(10%)',
    overlay: 'angel-halo'
  },
  {
    id: 'heart-shower',
    name: 'Love Shower',
    category: 'aesthetic',
    icon: '💖',
    tagline: 'Floating romantic hearts',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
    css: 'brightness(109%) saturate(140%) hue-rotate(345deg)',
    overlay: 'heart-shower'
  },
  {
    id: 'fire-aura',
    name: 'Fire Flame',
    category: 'trending',
    icon: '🔥',
    tagline: 'Burning flames & heat embers',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    css: 'contrast(130%) saturate(180%) hue-rotate(-10deg) brightness(105%)',
    overlay: 'fire-aura'
  },
  {
    id: 'vhs-1998',
    name: 'VHS Camcorder',
    category: 'retro',
    icon: '📼',
    tagline: '90s tape timestamp & scanlines',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    css: 'contrast(115%) saturate(135%) sepia(30%)',
    overlay: 'vhs-1998'
  },
  {
    id: 'kirakira',
    name: 'KiraKira Stars',
    category: 'aesthetic',
    icon: '💎',
    tagline: 'Twinkling diamond star bursts',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    css: 'brightness(112%) contrast(110%) saturate(135%)',
    overlay: 'kirakira'
  },
  {
    id: 'cyber-hud',
    name: 'Cyberpunk HUD',
    category: 'neon',
    icon: '⚡',
    tagline: 'Sci-fi visor & targeting reticle',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    css: 'contrast(140%) saturate(180%) hue-rotate(170deg) brightness(102%)',
    overlay: 'cyber-hud'
  },
  {
    id: 'matrix-rain',
    name: 'Matrix Code',
    category: 'neon',
    icon: '🟢',
    tagline: 'Cascading green digital rain',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    css: 'hue-rotate(90deg) saturate(190%) contrast(140%)',
    overlay: 'matrix-rain'
  },
  {
    id: 'fisheye',
    name: 'Fisheye Skater',
    category: 'retro',
    icon: '🛹',
    tagline: 'Curved 90s action cam lens',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #64748b 100%)',
    css: 'contrast(125%) saturate(130%) brightness(104%)',
    overlay: 'fisheye'
  },
  {
    id: 'crying-tears',
    name: 'Crying Drama',
    category: 'funny',
    icon: '😭',
    tagline: 'Streaming cartoon blue tears',
    gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    css: 'contrast(110%) saturate(145%) hue-rotate(190deg) brightness(102%)',
    overlay: 'crying-tears'
  },
  {
    id: 'alien-glow',
    name: 'Alien Glow',
    category: 'funny',
    icon: '👽',
    tagline: 'Extraterrestrial neon green aura',
    gradient: 'linear-gradient(135deg, #84cc16 0%, #4d7c0f 100%)',
    css: 'hue-rotate(100deg) saturate(220%) contrast(150%) brightness(110%)',
    overlay: 'alien-glow'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'aesthetic',
    icon: '🌅',
    tagline: 'Warm sunset skin glow',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    css: 'sepia(28%) saturate(155%) contrast(108%) brightness(106%) hue-rotate(-5deg)',
    overlay: 'golden-hour'
  },
  {
    id: 'soft-glam',
    name: 'Soft Glam',
    category: 'aesthetic',
    icon: '✨',
    tagline: 'Smooth radiance & beauty bloom',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
    css: 'brightness(112%) contrast(96%) saturate(125%)',
    overlay: 'soft-glam'
  },
  {
    id: 'noir-film',
    name: 'Cinema Noir',
    category: 'cinematic',
    icon: '🎬',
    tagline: 'Dramatic high-contrast B&W',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    css: 'grayscale(100%) contrast(155%) brightness(96%)',
    overlay: 'noir-film'
  },
  {
    id: 'vintage-70s',
    name: 'Polaroid 1974',
    category: 'retro',
    icon: '🎞️',
    tagline: 'Warm faded vintage print',
    gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
    css: 'sepia(65%) contrast(110%) brightness(98%) saturate(130%) hue-rotate(-12deg)',
    overlay: 'vintage-70s'
  },
  {
    id: 'glitch-static',
    name: 'Glitch Distort',
    category: 'neon',
    icon: '👾',
    tagline: 'Cyber chromatic RGB split',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #06b6d4 100%)',
    css: 'contrast(155%) saturate(200%) hue-rotate(180deg)',
    overlay: 'glitch'
  },
  {
    id: 'vivid-pop',
    name: 'Vivid Pop',
    category: 'trending',
    icon: '🌈',
    tagline: 'Punchy saturated colors',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
    css: 'saturate(200%) contrast(120%) brightness(104%)',
    overlay: null
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    category: 'cinematic',
    icon: '🎥',
    tagline: 'Hollywood blockbuster grading',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #f97316 100%)',
    css: 'contrast(125%) saturate(150%) hue-rotate(185deg) brightness(102%)',
    overlay: null
  }
];

export class FilterManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.activePresetId = 'none';
    this.brightness = 100; // 50 to 150%
    this.contrast = 100;   // 50 to 150%
    this.saturation = 100; // 0 to 200%
    this.zoom = 1.0;       // 1.0 to 4.0x
    this.mirror = true;    // Horizontal flip
    this.flipV = false;    // Vertical flip
  }

  setPreset(presetId) {
    this.activePresetId = presetId;
    this.applyToElement();
  }

  getPreset(presetId) {
    return FILTER_PRESETS.find((p) => p.id === presetId) || FILTER_PRESETS[0];
  }

  setAdjustments({ brightness, contrast, saturation }) {
    if (brightness !== undefined) this.brightness = brightness;
    if (contrast !== undefined) this.contrast = contrast;
    if (saturation !== undefined) this.saturation = saturation;
    this.applyToElement();
  }

  setZoom(zoomLevel) {
    this.zoom = Math.max(1.0, Math.min(4.0, parseFloat(zoomLevel) || 1.0));
    this.applyToElement();
  }

  setMirror(mirror) {
    this.mirror = !!mirror;
    this.applyToElement();
  }

  setFlipVertical(flip) {
    this.flipV = !!flip;
    this.applyToElement();
  }

  getFilterString() {
    const preset = FILTER_PRESETS.find((p) => p.id === this.activePresetId);
    const baseCss = preset && preset.css ? preset.css : '';

    const adjustParts = [];
    if (this.brightness !== 100) adjustParts.push(`brightness(${this.brightness}%)`);
    if (this.contrast !== 100) adjustParts.push(`contrast(${this.contrast}%)`);
    if (this.saturation !== 100) adjustParts.push(`saturate(${this.saturation}%)`);

    const combined = [baseCss, ...adjustParts].filter(Boolean).join(' ');
    return combined.trim() || 'none';
  }

  getTransformString() {
    const scaleX = this.mirror ? -this.zoom : this.zoom;
    const scaleY = this.flipV ? -this.zoom : this.zoom;
    return `scale(${scaleX}, ${scaleY})`;
  }

  applyToElement() {
    if (!this.video) return;
    this.video.style.filter = this.getFilterString();
    this.video.style.transform = this.getTransformString();
    this.video.style.transformOrigin = 'center center';
  }

  /**
   * Reset all adjustments back to neutral
   */
  resetAll() {
    this.activePresetId = 'none';
    this.brightness = 100;
    this.contrast = 100;
    this.saturation = 100;
    this.zoom = 1.0;
    this.applyToElement();
  }
}
