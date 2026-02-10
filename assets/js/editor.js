(function (blocks, blockEditor, components, element) {
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

    registerBlockType('advanced-gallery/gallery-block', {
        title: 'Advanced Gallery',
        icon: 'format-gallery',
        category: 'media',
        keywords: ['galerij', 'afbeeldingen', 'fotos'],
        description: 'Een geavanceerde galerij met responsive instellingen en lightbox.',
        supports: { align: true, html: false },

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
                { label: 'Geen', value: 'none' },
                { label: 'Zoom', value: 'zoom' },
                { label: 'Fade', value: 'fade' },
                { label: 'Blur', value: 'blur' },
            ];

            var animationOptions = [
                { label: 'Geen',       value: 'none' },
                { label: 'Fade In',    value: 'fadeIn' },
                { label: 'Schuif Omhoog', value: 'slideUp' },
                { label: 'Zoom In',    value: 'zoomIn' },
            ];

            return el(Fragment, {},
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Layout Instellingen' },
                        el(RangeControl, {
                            label: 'Kolommen (Desktop)',
                            value: attr.columns,
                            onChange: function (v) { set({ columns: v }); },
                            min: 1, max: 6,
                        }),
                        el(RangeControl, {
                            label: 'Kolommen (Tablet)',
                            value: attr.columnsTablet,
                            onChange: function (v) { set({ columnsTablet: v }); },
                            min: 1, max: 4,
                        }),
                        el(RangeControl, {
                            label: 'Kolommen (Mobiel)',
                            value: attr.columnsMobile,
                            onChange: function (v) { set({ columnsMobile: v }); },
                            min: 1, max: 3,
                        })
                    ),
                    el(PanelBody, { title: 'Afstanden' },
                        el(RangeControl, {
                            label: 'Afstand (Desktop)',
                            value: attr.gap,
                            onChange: function (v) { set({ gap: v }); },
                            min: 0, max: 50,
                        }),
                        el(RangeControl, {
                            label: 'Afstand (Mobiel)',
                            value: attr.gapMobile,
                            onChange: function (v) { set({ gapMobile: v }); },
                            min: 0, max: 30,
                        })
                    ),
                    el(PanelBody, { title: 'Visuele Effecten' },
                        el(SelectControl, {
                            label: 'Hover Effect',
                            value: attr.hoverEffect,
                            options: hoverEffectOptions,
                            onChange: function (v) { set({ hoverEffect: v }); },
                        }),
                        el(SelectControl, {
                            label: 'Animatie',
                            value: attr.animation,
                            options: animationOptions,
                            onChange: function (v) { set({ animation: v }); },
                        }),
                        el(RangeControl, {
                            label: 'Hoekafronding',
                            value: attr.borderRadius,
                            onChange: function (v) { set({ borderRadius: v }); },
                            min: 0, max: 50,
                        })
                    ),
                    el(PanelBody, { title: 'Functionaliteit' },
                        el(ToggleControl, {
                            label: 'Lightbox Inschakelen',
                            checked: attr.enableLightbox,
                            onChange: function (v) { set({ enableLightbox: v }); },
                        }),
                        el(ToggleControl, {
                            label: 'Bijschriften Tonen',
                            checked: attr.showCaptions,
                            onChange: function (v) { set({ showCaptions: v }); },
                        }),
                        el(TextControl, {
                            label: 'Aangepaste CSS Klasse',
                            value: attr.customClass,
                            onChange: function (v) { set({ customClass: v }); },
                        })
                    )
                ),

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
                                    }, 'Afbeeldingen Selecteren');
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
                                        }, 'Afbeeldingen Bewerken');
                                    },
                                })
                            )
                          )
                )
            );
        },

        save: function () {
            return null;
        },
    });

})(
    window.wp.blocks,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.element
);
