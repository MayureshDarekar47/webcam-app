/**
 * Media Gallery and Interactive Lightbox Viewer
 */

import { formatBytes, deleteMediaItem, clearAllMedia, getStorageEstimate } from './storage.js';
import { showToast } from './toast.js';

export class GalleryManager {
  constructor(containerElement, lightboxElement, options = {}) {
    this.container = containerElement;
    this.lightbox = lightboxElement;
    this.items = [];
    this.currentFilter = 'all'; // 'all' | 'photo' | 'video'
    this.activeLightboxIndex = -1;

    this.onItemsChanged = options.onItemsChanged || null;
    this._initLightboxControls();
  }

  setItems(items) {
    this.items = items || [];
    this.render();
  }

  addItem(item) {
    this.items.unshift(item);
    this.render();
    if (this.onItemsChanged) this.onItemsChanged(this.items);
  }

  setFilter(filter) {
    this.currentFilter = filter;
    this.render();
  }

  getFilteredItems() {
    if (this.currentFilter === 'all') return this.items;
    return this.items.filter((item) => item.type === this.currentFilter);
  }

  render() {
    if (!this.container) return;

    const filtered = this.getFilteredItems();

    // Update filter counts
    const countAll = this.items.length;
    const countPhotos = this.items.filter((i) => i.type === 'photo').length;
    const countVideos = this.items.filter((i) => i.type === 'video').length;

    const badgeAll = document.getElementById('count-all');
    const badgePhotos = document.getElementById('count-photos');
    const badgeVideos = document.getElementById('count-videos');
    if (badgeAll) badgeAll.textContent = countAll;
    if (badgePhotos) badgePhotos.textContent = countPhotos;
    if (badgeVideos) badgeVideos.textContent = countVideos;

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="gallery-empty-state">
          <div class="empty-icon-wrap">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <h3>No ${this.currentFilter === 'all' ? 'media' : this.currentFilter + 's'} yet</h3>
          <p>Captured photos and recorded videos will appear here. Everything is stored privately in your browser.</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'gallery-grid';

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `gallery-card card-type-${item.type}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${item.type}: ${item.name}`);

      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      const sizeStr = formatBytes(item.size);

      let mediaPreview = '';
      if (item.type === 'photo') {
        const url = item.dataUrl || (item.blob ? URL.createObjectURL(item.blob) : '');
        mediaPreview = `
          <div class="gallery-thumb-wrap">
            <img class="gallery-thumbnail" src="${url}" alt="${item.name}" loading="lazy" />
            <span class="media-badge badge-photo">Photo</span>
          </div>
        `;
      } else {
        const url = item.dataUrl || (item.blob ? URL.createObjectURL(item.blob) : '');
        mediaPreview = `
          <div class="gallery-thumb-wrap">
            <video class="gallery-thumbnail" src="${url}#t=0.1" preload="metadata"></video>
            <span class="media-badge badge-video">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              ${item.formattedDuration || 'Video'}
            </span>
            <div class="play-overlay-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        ${mediaPreview}
        <div class="gallery-info">
          <div class="gallery-filename" title="${item.name}">${item.name}</div>
          <div class="gallery-meta">
            <span>${dateStr}, ${timeStr}</span>
            <span>&bull;</span>
            <span>${sizeStr}</span>
          </div>
        </div>
        <div class="gallery-card-actions">
          <button class="btn-action-view" title="View Fullscreen" aria-label="View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </button>
          <button class="btn-action-download" title="Download" aria-label="Download">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="btn-action-delete" title="Delete" aria-label="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      // Event handlers
      card.querySelector('.btn-action-view').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openLightbox(item);
      });

      card.querySelector('.btn-action-download').addEventListener('click', (e) => {
        e.stopPropagation();
        this.downloadItem(item);
      });

      card.querySelector('.btn-action-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.deleteItem(item);
      });

      card.addEventListener('click', () => {
        this.openLightbox(item);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(item);
        }
      });

      grid.appendChild(card);
    });

    this.container.appendChild(grid);
  }

  /**
   * Download a media item cleanly to local computer
   */
  downloadItem(item) {
    if (!item) return;

    let url = item.dataUrl;
    if (!url && item.blob) {
      url = URL.createObjectURL(item.blob);
    }

    if (!url) {
      showToast('Cannot download item: media data missing', 'error');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast(`Downloaded ${item.name}`, 'success');
  }

  /**
   * Copy a photo directly to operating system clipboard
   */
  async copyPhotoToClipboard(item) {
    if (!item || item.type !== 'photo') return;

    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        showToast('Clipboard API not supported in this browser', 'warning');
        return;
      }

      let blob = item.blob;
      // Clipboard API strictly prefers PNG blobs
      if (!blob || blob.type !== 'image/png') {
        const img = new Image();
        img.src = item.dataUrl || URL.createObjectURL(blob);
        await new Promise((res) => (img.onload = res));

        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        blob = await new Promise((res) => c.toBlob(res, 'image/png'));
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      showToast('Photo copied to clipboard!', 'success');
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      showToast('Could not copy image to clipboard: ' + err.message, 'warning');
    }
  }

  /**
   * Delete an item from storage and UI
   */
  async deleteItem(item) {
    try {
      await deleteMediaItem(item.id);
      this.items = this.items.filter((i) => i.id !== item.id);
      this.render();
      if (this.onItemsChanged) this.onItemsChanged(this.items);
      showToast('Item deleted', 'info');
      if (this.lightbox && !this.lightbox.classList.contains('hidden')) {
        this.closeLightbox();
      }
    } catch (e) {
      showToast('Failed to delete item', 'error');
    }
  }

  /**
   * Download all media items
   */
  async downloadAll() {
    if (this.items.length === 0) {
      showToast('No media items to download', 'info');
      return;
    }

    showToast(`Downloading ${this.items.length} items...`, 'info');
    for (let i = 0; i < this.items.length; i++) {
      this.downloadItem(this.items[i]);
      // Slight delay so browser doesn't block multiple rapid downloads
      await new Promise((res) => setTimeout(res, 350));
    }
  }

  /**
   * Clear all items with callback
   */
  async clearAll() {
    try {
      await clearAllMedia();
      this.items = [];
      this.render();
      if (this.onItemsChanged) this.onItemsChanged(this.items);
      showToast('Gallery cleared', 'info');
    } catch (e) {
      showToast('Failed to clear gallery', 'error');
    }
  }

  /* Lightbox Methods */
  _initLightboxControls() {
    if (!this.lightbox) return;

    const closeBtn = this.lightbox.querySelector('.lightbox-close');
    const backdrop = this.lightbox.querySelector('.lightbox-backdrop');
    const prevBtn = this.lightbox.querySelector('.lightbox-prev');
    const nextBtn = this.lightbox.querySelector('.lightbox-next');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeLightbox());
    if (backdrop) backdrop.addEventListener('click', () => this.closeLightbox());

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.navigateLightbox(1));
    }

    window.addEventListener('keydown', (e) => {
      if (this.lightbox.classList.contains('hidden')) return;

      if (e.key === 'Escape') {
        this.closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        this.navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        this.navigateLightbox(1);
      }
    });
  }

  openLightbox(item) {
    if (!this.lightbox) return;
    const filtered = this.getFilteredItems();
    this.activeLightboxIndex = filtered.findIndex((i) => i.id === item.id);
    if (this.activeLightboxIndex === -1) this.activeLightboxIndex = 0;

    this._renderLightboxContent(item);
    this.lightbox.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }

  navigateLightbox(direction) {
    const filtered = this.getFilteredItems();
    if (filtered.length <= 1) return;

    this.activeLightboxIndex = (this.activeLightboxIndex + direction + filtered.length) % filtered.length;
    this._renderLightboxContent(filtered[this.activeLightboxIndex]);
  }

  _renderLightboxContent(item) {
    if (!item) return;

    const mediaArea = this.lightbox.querySelector('.lightbox-media-area');
    const title = this.lightbox.querySelector('.lightbox-title');
    const meta = this.lightbox.querySelector('.lightbox-meta');
    const actionsArea = this.lightbox.querySelector('.lightbox-actions-bar');

    if (title) title.textContent = item.name;

    const dateStr = new Date(item.timestamp).toLocaleString();
    const sizeStr = formatBytes(item.size);
    const dimensionsStr = item.width ? `${item.width} × ${item.height}px` : (item.formattedDuration || '');
    if (meta) meta.innerHTML = `<span>${dateStr}</span> &bull; <span>${sizeStr}</span> &bull; <span>${dimensionsStr}</span>`;

    const url = item.dataUrl || (item.blob ? URL.createObjectURL(item.blob) : '');

    if (mediaArea) {
      if (item.type === 'photo') {
        mediaArea.innerHTML = `<img class="lightbox-img" src="${url}" alt="${item.name}" />`;
      } else {
        mediaArea.innerHTML = `
          <video class="lightbox-video" src="${url}" controls autoplay playsinline></video>
        `;
      }
    }

    if (actionsArea) {
      actionsArea.innerHTML = `
        <button id="lb-download" class="btn btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
        ${item.type === 'photo' ? `
          <button id="lb-copy" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Image
          </button>
        ` : ''}
        <button id="lb-delete" class="btn btn-danger-outline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete
        </button>
      `;

      actionsArea.querySelector('#lb-download').addEventListener('click', () => this.downloadItem(item));
      if (item.type === 'photo') {
        actionsArea.querySelector('#lb-copy').addEventListener('click', () => this.copyPhotoToClipboard(item));
      }
      actionsArea.querySelector('#lb-delete').addEventListener('click', async () => {
        await this.deleteItem(item);
      });
    }
  }

  closeLightbox() {
    if (!this.lightbox) return;
    this.lightbox.classList.add('hidden');
    document.body.classList.remove('modal-open');

    // Stop video playback if active
    const video = this.lightbox.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
    }
  }
}
