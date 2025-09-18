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
            
            // Navigation buttons
            $('.lightbox-prev').on('click', function(e) {
                e.stopPropagation();
                self.previousImage();
            });
            
            $('.lightbox-next').on('click', function(e) {
                e.stopPropagation();
                self.nextImage();
            });
            
            // Keyboard navigation
            $(document).on('keydown.lightbox', function(e) {
                if (self.$lightbox.hasClass('active')) {
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
            }, 300);
            
            // Clean up event listeners
            $('.lightbox-image').off('.lightbox');
            
            // Reset image after closing
            setTimeout(function() {
                $('.lightbox-image').attr('src', '').attr('alt', '');
            }, 300);
        },

        /**
         * Show previous image
         */
        previousImage: function() {
            if (!this.isTransitioning && this.currentGallery.length > 1) {
                this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.currentGallery.length - 1;
                this.showLightboxImage();
            }
        },

        /**
         * Show next image
         */
        nextImage: function() {
            if (!this.isTransitioning && this.currentGallery.length > 1) {
                this.currentIndex = (this.currentIndex < this.currentGallery.length - 1) ? this.currentIndex + 1 : 0;
                this.showLightboxImage();
            }
        },

        /**
         * Display current image in lightbox
         */
        showLightboxImage: function() {
            if (!this.currentGallery[this.currentIndex]) {
                return;
            }
            
            this.isTransitioning = true;
            const item = this.currentGallery[this.currentIndex];
            const $image = $('.lightbox-image');
            
            // Set new image src
            $image.attr('src', item.src).attr('alt', item.title || '');
            
            // When new image loads
            $image.on('load.lightbox', function() {
                this.isTransitioning = false;
            }.bind(this)).on('error.lightbox', function() {
                console.error('Error loading image:', item.src);
                this.isTransitioning = false;
            }.bind(this));
            
            // If image is already cached, the load event might not fire
            if ($image[0].complete) {
                this.isTransitioning = false;
            }
            
            // Show/hide navigation based on gallery length
            $('.lightbox-prev, .lightbox-next').toggle(this.currentGallery.length > 1);
        }
    };

})(jQuery);