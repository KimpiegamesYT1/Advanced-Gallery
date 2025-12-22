/**
 * Lightbox Module JavaScript
 * Advanced Gallery Block - Lightbox Functionality
 * 
 * Deze file bevat alle JavaScript voor de lightbox functionaliteit
 * van de Advanced Gallery Block plugin.
 */

(function($) {
    'use strict';

    // Lightbox namespace
    window.AdvancedGalleryLightbox = {
        currentGallery: [],
        currentIndex: 0,
        $lightbox: null,
        isTransitioning: false,
        imageCache: {},

        /**
         * Initialize lightbox functionality
         */
        init: function() {
            this.createLightboxHTML();
            this.bindEvents();
        },

        /**
         * Create lightbox HTML structure if it doesn't exist
         */
        createLightboxHTML: function() {
            if ($('.lightbox-overlay').length === 0) {
                $('body').append(`
                    <div class="lightbox-overlay">
                        <div class="lightbox-container">
                            <img class="lightbox-image" src="" alt="">
                        </div>
                        <button class="lightbox-close">×</button>
                        <button class="lightbox-prev">‹</button>
                        <button class="lightbox-next">›</button>
                    </div>
                `);
            }
            this.$lightbox = $('.lightbox-overlay');
        },

        /**
         * Bind all lightbox events
         */
        bindEvents: function() {
            const self = this;

            // Open lightbox when clicking a gallery item
            $(document).on('click', '.advanced-gallery.lightbox-enabled .gallery-link', function(e) {
                e.preventDefault();
                self.openLightbox($(this));
            });
            
            // Close on backdrop click or close button
            this.$lightbox.on('click', function(e) {
                if ($(e.target).is(self.$lightbox) || 
                    $(e.target).hasClass('lightbox-close') || 
                    $(e.target).hasClass('lightbox-container')) {
                    self.closeLightbox();
                }
            });
            
            // Navigation buttons - use event delegation for better performance
            this.$lightbox.on('click', '.lightbox-prev', function(e) {
                e.stopPropagation();
                if (!self.isTransitioning) {
                    self.previousImage();
                }
            });
            
            this.$lightbox.on('click', '.lightbox-next', function(e) {
                e.stopPropagation();
                if (!self.isTransitioning) {
                    self.nextImage();
                }
            });
            
            // Keyboard navigation - instant response
            $(document).on('keydown.lightbox', function(e) {
                if (self.$lightbox.hasClass('active') && !self.isTransitioning) {
                    switch(e.keyCode) {
                        case 27: // ESC
                            self.closeLightbox();
                            break;
                        case 37: // Left arrow
                            self.previousImage();
                            break;
                        case 39: // Right arrow
                            self.nextImage();
                            break;
                    }
                }
            });
        },

        /**
         * Open lightbox with specific gallery item
         */
        openLightbox: function($clickedItem) {
            const galleryId = $clickedItem.data('lightbox');
            const self = this;
            this.currentGallery = [];
            
            // Build gallery array
            $(`[data-lightbox="${galleryId}"]`).each(function() {
                self.currentGallery.push({
                    src: $(this).attr('href'),
                    title: $(this).data('title') || ''
                });
            });
            
            this.currentIndex = $clickedItem.closest('.gallery-item').data('index') || 0;
            this.showLightboxImage();
            
            // Show lightbox with animation
            this.$lightbox.css('display', 'flex');
            $('body').css('overflow', 'hidden');
            
            // Trigger animation after a small delay to ensure display:flex is applied
            setTimeout(function() {
                self.$lightbox.addClass('active');
            }, 10);
        },

        /**
         * Close lightbox
         */
        closeLightbox: function() {
            const self = this;
            
            // Start fade-out animation
            this.$lightbox.removeClass('active');
            $('body').css('overflow', '');
            
            // Hide lightbox after animation completes
            setTimeout(function() {
                self.$lightbox.css('display', 'none');
                $('.lightbox-image').attr('src', '').attr('alt', '');
            }, 300);
        },

        /**
         * Show previous image
         */
        previousImage: function() {
            if (this.currentGallery.length > 1) {
                this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.currentGallery.length - 1;
                this.showLightboxImage();
            }
        },

        /**
         * Show next image
         */
        nextImage: function() {
            if (this.currentGallery.length > 1) {
                this.currentIndex = (this.currentIndex < this.currentGallery.length - 1) ? this.currentIndex + 1 : 0;
                this.showLightboxImage();
            }
        },

        /**
         * Preload adjacent images for instant switching
         */
        preloadAdjacentImages: function() {
            const self = this;
            const nextIndex = (this.currentIndex < this.currentGallery.length - 1) ? this.currentIndex + 1 : 0;
            const prevIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.currentGallery.length - 1;
            
            [nextIndex, prevIndex].forEach(function(index) {
                const item = self.currentGallery[index];
                if (item && !self.imageCache[item.src]) {
                    const img = new Image();
                    img.onload = function() {
                        self.imageCache[item.src] = true;
                    };
                    img.src = item.src;
                }
            });
        },

        /**
         * Display current image in lightbox with instant response
         */
        showLightboxImage: function() {
            if (!this.currentGallery[this.currentIndex]) {
                return;
            }
            
            const self = this;
            const item = this.currentGallery[this.currentIndex];
            const $image = $('.lightbox-image');
            
            // Brief transition lock (150ms) for smooth fade
            this.isTransitioning = true;
            setTimeout(function() {
                self.isTransitioning = false;
            }, 150);
            
            // Fade out current image
            $image.css('opacity', '0');
            
            // Quick switch to new image
            setTimeout(function() {
                $image.attr('src', item.src).attr('alt', item.title || '');
                
                // Fade in new image
                $image.css('opacity', '1');
                
                // Preload next/previous images
                self.preloadAdjacentImages();
            }, 100);
            
            // Show/hide navigation based on gallery length
            $('.lightbox-prev, .lightbox-next').toggle(this.currentGallery.length > 1);
        }
    };

})(jQuery);