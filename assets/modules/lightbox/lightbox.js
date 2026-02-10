(function () {
    'use strict';

    var AGBLightbox = {
        currentGallery: [],
        currentIndex: 0,
        overlay: null,
        isTransitioning: false,
        imageCache: {},
        touchStartX: 0,
        touchEndX: 0,
        previousFocus: null,

        init: function () {
            if (!document.querySelector('.agb-lightbox-enabled')) {
                return;
            }
            this.createHTML();
            this.bindEvents();
        },

        createHTML: function () {
            if (document.querySelector('.agb-lightbox-overlay')) {
                return;
            }

            var overlay = document.createElement('div');
            overlay.className = 'agb-lightbox-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Afbeelding lightbox');
            overlay.innerHTML =
                '<div class="agb-lightbox-container">' +
                    '<img class="agb-lightbox-image" src="" alt="">' +
                '</div>' +
                '<button class="agb-lightbox-close" aria-label="Lightbox sluiten">' +
                    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
                '<button class="agb-lightbox-prev" aria-label="Vorige afbeelding">' +
                    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
                '</button>' +
                '<button class="agb-lightbox-next" aria-label="Volgende afbeelding">' +
                    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>' +
                '</button>';

            document.body.appendChild(overlay);
            this.overlay = overlay;
        },

        bindEvents: function () {
            var self = this;

            document.addEventListener('click', function (e) {
                var link = e.target.closest('.agb-lightbox-enabled .agb-gallery-link');
                if (link) {
                    e.preventDefault();
                    self.open(link);
                }
            });

            this.overlay.addEventListener('click', function (e) {
                if (
                    e.target === self.overlay ||
                    e.target.closest('.agb-lightbox-close') ||
                    e.target.classList.contains('agb-lightbox-container')
                ) {
                    self.close();
                }
            });

            this.overlay.querySelector('.agb-lightbox-prev').addEventListener('click', function (e) {
                e.stopPropagation();
                if (!self.isTransitioning) { self.prev(); }
            });

            this.overlay.querySelector('.agb-lightbox-next').addEventListener('click', function (e) {
                e.stopPropagation();
                if (!self.isTransitioning) { self.next(); }
            });

            document.addEventListener('keydown', function (e) {
                if (!self.overlay.classList.contains('agb-active')) { return; }

                switch (e.key) {
                    case 'Escape':
                        self.close();
                        break;
                    case 'ArrowLeft':
                        if (!self.isTransitioning) { self.prev(); }
                        break;
                    case 'ArrowRight':
                        if (!self.isTransitioning) { self.next(); }
                        break;
                    case 'Tab':
                        self.trapFocus(e);
                        break;
                }
            });

            this.overlay.addEventListener('touchstart', function (e) {
                self.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.overlay.addEventListener('touchend', function (e) {
                self.touchEndX = e.changedTouches[0].screenX;
                self.handleSwipe();
            }, { passive: true });
        },

        handleSwipe: function () {
            var threshold = 50;
            var diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) < threshold) { return; }

            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        },

        trapFocus: function (e) {
            var focusable = this.overlay.querySelectorAll(
                'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
            );

            if (focusable.length === 0) { return; }

            var first = focusable[0];
            var last  = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },

        open: function (clickedLink) {
            var galleryId = clickedLink.dataset.lightbox;
            var self = this;
            this.currentGallery = [];

            document.querySelectorAll('[data-lightbox="' + galleryId + '"]').forEach(function (link) {
                self.currentGallery.push({
                    src: link.href,
                    title: link.dataset.title || '',
                });
            });

            var item = clickedLink.closest('.agb-gallery-item');
            this.currentIndex = item ? parseInt(item.dataset.index, 10) || 0 : 0;

            this.previousFocus = document.activeElement;
            this.showImage();

            this.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            requestAnimationFrame(function () {
                self.overlay.classList.add('agb-active');
                var closeBtn = self.overlay.querySelector('.agb-lightbox-close');
                if (closeBtn) { closeBtn.focus(); }
            });
        },

        close: function () {
            var self = this;

            this.overlay.classList.remove('agb-active');
            document.body.style.overflow = '';

            setTimeout(function () {
                self.overlay.style.display = 'none';
                var img = self.overlay.querySelector('.agb-lightbox-image');
                if (img) {
                    img.src = '';
                    img.alt = '';
                }
                if (self.previousFocus) {
                    self.previousFocus.focus();
                    self.previousFocus = null;
                }
            }, 300);
        },

        prev: function () {
            if (this.currentGallery.length <= 1) { return; }
            this.currentIndex = this.currentIndex > 0
                ? this.currentIndex - 1
                : this.currentGallery.length - 1;
            this.showImage();
        },

        next: function () {
            if (this.currentGallery.length <= 1) { return; }
            this.currentIndex = this.currentIndex < this.currentGallery.length - 1
                ? this.currentIndex + 1
                : 0;
            this.showImage();
        },

        preloadAdjacent: function () {
            var self = this;
            var len = this.currentGallery.length;
            var nextIdx = (this.currentIndex + 1) % len;
            var prevIdx = (this.currentIndex - 1 + len) % len;

            [nextIdx, prevIdx].forEach(function (idx) {
                var item = self.currentGallery[idx];
                if (item && !self.imageCache[item.src]) {
                    var img = new Image();
                    img.onload = function () {
                        self.imageCache[item.src] = true;
                    };
                    img.src = item.src;
                }
            });
        },

        showImage: function () {
            var item = this.currentGallery[this.currentIndex];
            if (!item) { return; }

            var self  = this;
            var image = this.overlay.querySelector('.agb-lightbox-image');

            this.isTransitioning = true;
            setTimeout(function () { self.isTransitioning = false; }, 150);

            image.style.opacity = '0';
            setTimeout(function () {
                image.src = item.src;
                image.alt = item.title || '';
                image.style.opacity = '1';
                self.preloadAdjacent();
            }, 100);

            var showNav = this.currentGallery.length > 1;
            this.overlay.querySelector('.agb-lightbox-prev').style.display = showNav ? '' : 'none';
            this.overlay.querySelector('.agb-lightbox-next').style.display = showNav ? '' : 'none';
        },
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { AGBLightbox.init(); });
    } else {
        AGBLightbox.init();
    }
})();