/**
 * Advanced Gallery Block — Editor Script
 *
 * Registers the block client-side with edit/save functions.
 * Attributes are defined in block.json.
 */
(function (blocks, blockEditor, components, element, i18n) {
    var registerBlockType = blocks.registerBlockType;
    var MediaUpload       = blockEditor.MediaUpload;
    var MediaUploadCheck  = blockEditor.MediaUploadCheck;
    var InspectorControls = blockEditor.InspectorControls;
    var PanelBody     = components.PanelBody;
    var RangeControl  = components.RangeControl;
    var SelectControl = components.SelectControl;
    var ToggleControl = components.ToggleControl;
    var TextControl   = components.TextControl;
    var Button        = components.Button;
    var el            = element.createElement;
    var Fragment      = element.Fragment;
    var __            = i18n.__;

    registerBlockType('advanced-gallery/gallery-block', {
        title: __('Advanced Gallery', 'advanced-gallery-block'),
        icon: 'format-gallery',
        category: 'media',
        keywords: [
            __('gallery', 'advanced-gallery-block'),
            __('images', 'advanced-gallery-block'),
            __('photos', 'advanced-gallery-block'),
        ],
        description: __('An advanced gallery with responsive settings and lightbox.', 'advanced-gallery-block'),
        supports: { align: true, html: false },

        /* ------------------------------------------------------------------ */
        edit: function (props) {
            var attr = props.attributes;
            var set  = props.setAttributes;

            var onSelectImages = function (newImages) {
                set({
                    images: newImages.map(function (img) {
                        return { id: img.id, url: img.url, alt: img.alt, caption: img.caption };
                    }),
                });
            };

            var hoverEffectOptions = [
                { label: __('None', 'advanced-gallery-block'), value: 'none' },
                { label: __('Zoom', 'advanced-gallery-block'), value: 'zoom' },
                { label: __('Fade', 'advanced-gallery-block'), value: 'fade' },
                { label: __('Blur', 'advanced-gallery-block'), value: 'blur' },
            ];

            var animationOptions = [
                { label: __('None', 'advanced-gallery-block'),     value: 'none' },
                { label: __('Fade In', 'advanced-gallery-block'),  value: 'fadeIn' },
                { label: __('Slide Up', 'advanced-gallery-block'), value: 'slideUp' },
                { label: __('Zoom In', 'advanced-gallery-block'),  value: 'zoomIn' },
            ];

            return el(Fragment, {},
                /* ----- Inspector sidebar ----- */
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Layout Settings', 'advanced-gallery-block') },
                        el(RangeControl, {
                            label: __('Columns (Desktop)', 'advanced-gallery-block'),
                            value: attr.columns,
                            onChange: function (v) { set({ columns: v }); },
                            min: 1, max: 6,
                        }),
                        el(RangeControl, {
                            label: __('Columns (Tablet)', 'advanced-gallery-block'),
                            value: attr.columnsTablet,
                            onChange: function (v) { set({ columnsTablet: v }); },
                            min: 1, max: 4,
                        }),
                        el(RangeControl, {
                            label: __('Columns (Mobile)', 'advanced-gallery-block'),
                            value: attr.columnsMobile,
                            onChange: function (v) { set({ columnsMobile: v }); },
                            min: 1, max: 3,
                        })
                    ),
                    el(PanelBody, { title: __('Spacing', 'advanced-gallery-block') },
                        el(RangeControl, {
                            label: __('Gap (Desktop)', 'advanced-gallery-block'),
                            value: attr.gap,
                            onChange: function (v) { set({ gap: v }); },
                            min: 0, max: 50,
                        }),
                        el(RangeControl, {
                            label: __('Gap (Mobile)', 'advanced-gallery-block'),
                            value: attr.gapMobile,
                            onChange: function (v) { set({ gapMobile: v }); },
                            min: 0, max: 30,
                        })
                    ),
                    el(PanelBody, { title: __('Visual Effects', 'advanced-gallery-block') },
                        el(SelectControl, {
                            label: __('Hover Effect', 'advanced-gallery-block'),
                            value: attr.hoverEffect,
                            options: hoverEffectOptions,
                            onChange: function (v) { set({ hoverEffect: v }); },
                        }),
                        el(SelectControl, {
                            label: __('Animation', 'advanced-gallery-block'),
                            value: attr.animation,
                            options: animationOptions,
                            onChange: function (v) { set({ animation: v }); },
                        }),
                        el(RangeControl, {
                            label: __('Border Radius', 'advanced-gallery-block'),
                            value: attr.borderRadius,
                            onChange: function (v) { set({ borderRadius: v }); },
                            min: 0, max: 50,
                        })
                    ),
                    el(PanelBody, { title: __('Functionality', 'advanced-gallery-block') },
                        el(ToggleControl, {
                            label: __('Enable Lightbox', 'advanced-gallery-block'),
                            checked: attr.enableLightbox,
                            onChange: function (v) { set({ enableLightbox: v }); },
                        }),
                        el(ToggleControl, {
                            label: __('Show Captions', 'advanced-gallery-block'),
                            checked: attr.showCaptions,
                            onChange: function (v) { set({ showCaptions: v }); },
                        }),
                        el(TextControl, {
                            label: __('Custom CSS Class', 'advanced-gallery-block'),
                            value: attr.customClass,
                            onChange: function (v) { set({ customClass: v }); },
                        })
                    )
                ),

                /* ----- Block content ----- */
                el('div', { className: 'agb-editor' },
                    attr.images.length === 0
                        ? el(MediaUploadCheck, {},
                            el(MediaUpload, {
                                onSelect: onSelectImages,
                                allowedTypes: ['image'],
                                multiple: true,
                                value: attr.images.map(function (img) { return img.id; }),
                                render: function (ref) {
                                    return el(Button, {
                                        isPrimary: true,
                                        onClick: ref.open,
                                        className: 'agb-editor-button',
                                    }, __('Select Images', 'advanced-gallery-block'));
                                },
                            })
                          )
                        : el('div', { className: 'agb-preview-wrapper' },
                            el('div', {
                                className: 'agb-preview',
                                style: {
                                    gridTemplateColumns: 'repeat(' + Math.min(attr.columns, 4) + ', 1fr)',
                                    gap: attr.gap + 'px',
                                },
                            },
                                attr.images.slice(0, 8).map(function (img) {
                                    return el('img', { key: img.id, src: img.url, alt: img.alt });
                                }),
                                attr.images.length > 8 && el('div', {
                                    className: 'agb-more-indicator',
                                }, '+' + (attr.images.length - 8))
                            ),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: onSelectImages,
                                    allowedTypes: ['image'],
                                    multiple: true,
                                    gallery: true,
                                    value: attr.images.map(function (img) { return img.id; }),
                                    render: function (ref) {
                                        return el(Button, {
                                            isSecondary: true,
                                            onClick: ref.open,
                                        }, __('Edit Images', 'advanced-gallery-block'));
                                    },
                                })
                            )
                          )
                )
            );
        },

        /* ------------------------------------------------------------------ */
        save: function () {
            return null; // Server-side rendering via PHP.
        },
    });

})(
    window.wp.blocks,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.element,
    window.wp.i18n
);
