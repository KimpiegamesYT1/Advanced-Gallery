(function (blocks, blockEditor, components, element, i18n) {
    const { registerBlockType } = blocks;
    const { MediaUpload, MediaUploadCheck, InspectorControls } = blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = components;
    const { createElement, Fragment } = element;
    const { __ } = i18n;

    registerBlockType("advanced-gallery/gallery-block", {
        title: __("Advanced Gallery", "advanced-gallery-block"),
        icon: "format-gallery",
        category: "media",
        keywords: [__("gallery", "advanced-gallery-block"), __("images", "advanced-gallery-block"), __("photos", "advanced-gallery-block")],
        description: __("Een geavanceerde galerij met responsive instellingen en lightbox.", "advanced-gallery-block"),
        supports: { align: true, html: false },

        edit: function (props) {
            const { attributes, setAttributes } = props;
            const { images, columns, columnsTablet, columnsMobile, gap, gapMobile, enableLightbox, showCaptions, hoverEffect, animation, borderRadius, customClass } = attributes;

            const onSelectImages = (newImages) => {
                setAttributes({ images: newImages.map(img => ({ id: img.id, url: img.url, alt: img.alt, caption: img.caption })) });
            };

            const hoverEffectOptions = [
                { label: __("Geen", "advanced-gallery-block"), value: "none" },
                { label: __("Zoom", "advanced-gallery-block"), value: "zoom" },
                { label: __("Fade", "advanced-gallery-block"), value: "fade" },
                { label: __("Blur", "advanced-gallery-block"), value: "blur" }
            ];

            const animationOptions = [
                { label: __("Geen", "advanced-gallery-block"), value: "none" },
                { label: __("Fade In", "advanced-gallery-block"), value: "fadeIn" },
                { label: __("Slide Up", "advanced-gallery-block"), value: "slideUp" },
                { label: __("Zoom In", "advanced-gallery-block"), value: "zoomIn" }
            ];

            return createElement(Fragment, {},
                createElement(InspectorControls, {},
                    createElement(PanelBody, { title: __("Layout Instellingen", "advanced-gallery-block") },
                        createElement(RangeControl, { label: __("Kolommen (Desktop)", "advanced-gallery-block"), value: columns, onChange: (value) => setAttributes({ columns: value }), min: 1, max: 6 }),
                        createElement(RangeControl, { label: __("Kolommen (Tablet)", "advanced-gallery-block"), value: columnsTablet, onChange: (value) => setAttributes({ columnsTablet: value }), min: 1, max: 4 }),
                        createElement(RangeControl, { label: __("Kolommen (Mobiel)", "advanced-gallery-block"), value: columnsMobile, onChange: (value) => setAttributes({ columnsMobile: value }), min: 1, max: 3 })
                    ),
                    createElement(PanelBody, { title: __("Spacing", "advanced-gallery-block") },
                        createElement(RangeControl, { label: __("Afstand (Desktop)", "advanced-gallery-block"), value: gap, onChange: (value) => setAttributes({ gap: value }), min: 0, max: 50 }),
                        createElement(RangeControl, { label: __("Afstand (Mobiel)", "advanced-gallery-block"), value: gapMobile, onChange: (value) => setAttributes({ gapMobile: value }), min: 0, max: 30 })
                    ),
                    createElement(PanelBody, { title: __("Visuele Effecten", "advanced-gallery-block") },
                        createElement(SelectControl, { label: __("Hover Effect", "advanced-gallery-block"), value: hoverEffect, options: hoverEffectOptions, onChange: (value) => setAttributes({ hoverEffect: value }) }),
                        createElement(SelectControl, { label: __("Animatie", "advanced-gallery-block"), value: animation, options: animationOptions, onChange: (value) => setAttributes({ animation: value }) }),
                        createElement(RangeControl, { label: __("Border Radius", "advanced-gallery-block"), value: borderRadius, onChange: (value) => setAttributes({ borderRadius: value }), min: 0, max: 50 })
                    ),
                    createElement(PanelBody, { title: __("Functionaliteit", "advanced-gallery-block") },
                        createElement(ToggleControl, { label: __("Lightbox inschakelen", "advanced-gallery-block"), checked: enableLightbox, onChange: (value) => setAttributes({ enableLightbox: value }) }),
                        createElement(ToggleControl, { label: __("Captions tonen", "advanced-gallery-block"), checked: showCaptions, onChange: (value) => setAttributes({ showCaptions: value }) }),
                        createElement(TextControl, { label: __("Custom CSS Class", "advanced-gallery-block"), value: customClass, onChange: (value) => setAttributes({ customClass: value }) })
                    )
                ),
                createElement("div", { className: "advanced-gallery-editor" },
                    images.length === 0 ?
                        createElement(MediaUploadCheck, {},
                            createElement(MediaUpload, {
                                onSelect: onSelectImages,
                                allowedTypes: ["image"],
                                multiple: true,
                                value: images.map(img => img.id),
                                render: ({ open }) => createElement(Button, { isPrimary: true, onClick: open, className: "editor-gallery-button" }, __("Selecteer Afbeeldingen", "advanced-gallery-block"))
                            })
                        ) :
                        createElement("div", { className: "gallery-preview-wrapper" },
                            createElement("div", {
                                className: "gallery-preview",
                                style: { gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`, gap: `${gap}px` }
                            },
                                images.slice(0, 8).map(img => createElement("img", { key: img.id, src: img.url, alt: img.alt })),
                                images.length > 8 && createElement("div", { className: "more-images-indicator" }, `+${images.length - 8}`)
                            ),
                            createElement(MediaUploadCheck, {},
                                createElement(MediaUpload, {
                                    onSelect: onSelectImages,
                                    allowedTypes: ["image"],
                                    multiple: true,
                                    gallery: true,
                                    value: images.map(img => img.id),
                                    render: ({ open }) => createElement(Button, { isSecondary: true, onClick: open }, __("Afbeeldingen Bewerken", "advanced-gallery-block"))
                                })
                            )
                        )
                )
            );
        },
        save: function () {
            return null; // Server-side rendering
        }
    });
})(window.wp.blocks, window.wp.blockEditor, window.wp.components, window.wp.element, window.wp.i18n);
