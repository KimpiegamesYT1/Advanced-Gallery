(function($) {
    $(document).ready(function() {
        try {
            initAdvancedGallery();
        } catch(e) {
            console.error('Error initializing gallery:', e.message);
        }
    });

    function initAdvancedGallery() {
        // Initialize lightbox if available
        if (typeof window.AdvancedGalleryLightbox !== 'undefined') {
            window.AdvancedGalleryLightbox.init();
        }
        
        // Lazy loading with fallbacks
        if ('IntersectionObserver' in window) {
            const lazyImageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        lazyImageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img.lazy').forEach(function(img) {
                lazyImageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            $('img.lazy').each(function() {
                $(this).attr('src', $(this).data('src')).addClass('loaded');
            });
        }

        // Masonry layout - now the only layout
        $('.advanced-gallery').each(function() {
            const $gallery = $(this);
            
            // Set a default grid-auto-rows if not already set
            if (!$gallery.css('grid-auto-rows')) {
                $gallery.css('grid-auto-rows', '1px');
            }
            
            function resizeGridItems() {
                const gridGap = parseInt(window.getComputedStyle($gallery[0]).getPropertyValue('grid-gap') || '10px');
                const rowHeight = parseInt($gallery.css('grid-auto-rows'));
                
                $gallery.find('.gallery-item').each(function() {
                    const $item = $(this);
                    const $img = $item.find('img');
                    
                    // Calculate row span
                    const calcRowSpan = function() {
                        const imageHeight = $img[0].offsetHeight;
                        const rowSpan = Math.ceil((imageHeight + gridGap) / (rowHeight + gridGap));
                        $item.css('grid-row-end', 'span ' + rowSpan);
                    };
                    
                    // Calculate after image loads
                    if ($img.complete) {
                        calcRowSpan();
                    } else {
                        $img.on('load', calcRowSpan);
                    }
                });
            }
            
            // Initial resize and on window resize
            resizeGridItems();
            $(window).on('resize', debounce(resizeGridItems, 250));
        });
        
        // Utility function
        function debounce(func, wait) {
            let timeout;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        }
    }
})(jQuery);
