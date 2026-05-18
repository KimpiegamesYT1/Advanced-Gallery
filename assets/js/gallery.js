(function () {
    'use strict';

    function markLoaded(img) {
        var item = img.closest('.agb-gallery-item');
        if (item) {
            item.classList.remove('agb-error');
            item.classList.add('agb-loaded');
        }
    }

    function markError(img) {
        var item = img.closest('.agb-gallery-item');
        if (item) {
            item.classList.remove('agb-loaded');
            item.classList.add('agb-error');
        }
    }

    function initImage(img) {
        if (img.complete && img.naturalWidth > 0) {
            markLoaded(img);
            return;
        }

        if (img.complete && img.naturalWidth === 0) {
            markError(img);
            return;
        }

        img.addEventListener('load', function () { markLoaded(img); }, { once: true });
        img.addEventListener('error', function () { markError(img); }, { once: true });
    }

    function initGallery() {
        document.querySelectorAll('.agb-gallery-image').forEach(initImage);
    }

    function observeNewImages() {
        if (!window.MutationObserver) { return; }

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) { return; }
                    if (node.classList && node.classList.contains('agb-gallery-image')) {
                        initImage(node);
                    }
                    if (node.querySelectorAll) {
                        node.querySelectorAll('.agb-gallery-image').forEach(initImage);
                    }
                });
            });
        });

        document.querySelectorAll('.agb-gallery').forEach(function (gallery) {
            observer.observe(gallery, { childList: true, subtree: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initGallery();
            observeNewImages();
        });
    } else {
        initGallery();
        observeNewImages();
    }
})();
