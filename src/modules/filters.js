/**
 * Real-time Video Filters, Color Grading, and Digital Zoom
 */

export const FILTER_PRESETS = [
  { id: 'none', name: 'Normal', css: '' },
  { id: 'bw', name: 'B&W Film', css: 'grayscale(100%) contrast(120%) brightness(105%)' },
  { id: 'sepia', name: 'Vintage Sepia', css: 'sepia(80%) contrast(95%) brightness(95%) saturate(120%)' },
  { id: 'warm', name: 'Golden Glow', css: 'sepia(30%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: 'Nordic Slate', css: 'hue-rotate(190deg) saturate(85%) contrast(110%)' },
  { id: 'cyberpunk', name: 'Cyberpunk', css: 'contrast(135%) saturate(175%) hue-rotate(300deg)' },
  { id: 'dramatic', name: 'High Contrast', css: 'contrast(150%) brightness(95%) saturate(115%)' },
  { id: 'privacy-blur', name: 'Privacy Blur', css: 'blur(14px)' }
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
