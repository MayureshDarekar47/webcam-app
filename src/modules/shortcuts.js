/**
 * Keyboard shortcuts manager for accessibility and rapid camera operation
 */

export class ShortcutsManager {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.enabled = true;
    this._onKeyDown = this._onKeyDown.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  _onKeyDown(e) {
    if (!this.enabled) return;

    // Ignore keypresses inside form inputs, textareas, selects
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      return;
    }

    const key = e.key;

    switch (key) {
      case ' ':
        e.preventDefault();
        if (this.handlers.onPrimaryAction) this.handlers.onPrimaryAction();
        break;

      case 'r':
      case 'R':
        e.preventDefault();
        if (this.handlers.onToggleRecord) this.handlers.onToggleRecord();
        break;

      case 'p':
      case 'P':
        e.preventDefault();
        if (this.handlers.onTogglePause) this.handlers.onTogglePause();
        break;

      case 'm':
      case 'M':
        e.preventDefault();
        if (this.handlers.onToggleMirror) this.handlers.onToggleMirror();
        break;

      case 'g':
      case 'G':
        e.preventDefault();
        if (this.handlers.onCycleGrid) this.handlers.onCycleGrid();
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        if (this.handlers.onToggleFullscreen) this.handlers.onToggleFullscreen();
        break;

      case 'c':
      case 'C':
        e.preventDefault();
        if (this.handlers.onFlipCamera) this.handlers.onFlipCamera();
        break;

      case 'b':
      case 'B':
        e.preventDefault();
        if (this.handlers.onCycleFilter) this.handlers.onCycleFilter();
        break;

      case '?':
        e.preventDefault();
        if (this.handlers.onToggleHelp) this.handlers.onToggleHelp();
        break;

      case 'Escape':
        if (this.handlers.onEscape) this.handlers.onEscape();
        break;

      default:
        break;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
  }
}
