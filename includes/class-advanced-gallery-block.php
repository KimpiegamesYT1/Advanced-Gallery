<?php
/**
 * Advanced Gallery Block — Main Class
 *
 * Handles block registration, asset management, and server-side rendering.
 *
 * @package AdvancedGalleryBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit( 'Direct access forbidden.' );
}

class AdvancedGalleryBlock {

    /** @var self|null Singleton instance. */
    private static $instance = null;

    /**
     * Return the singleton instance.
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor — use get_instance().
     */
    private function __construct() {
        add_action( 'init', array( $this, 'init' ) );
    }

    /** Prevent cloning. */
    private function __clone() {}

    /** Prevent unserialization. */
    public function __wakeup() {
        throw new \Exception( 'Cannot unserialize a singleton.' );
    }

    /* ------------------------------------------------------------------
     * Initialization
     * ----------------------------------------------------------------*/

    public function init() {
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }
        $this->register_block();
    }

    /**
     * Register the block using block.json metadata.
     * Manually register frontend + lightbox assets for conditional loading.
     */
    public function register_block() {
        // block.json handles editorScript, editorStyle, and style automatically.
        register_block_type(
            ADVANCED_GALLERY_BLOCK_PLUGIN_DIR,
            array( 'render_callback' => array( $this, 'render_block' ) )
        );

        // Frontend script — registered here, enqueued in render_block().
        wp_register_script(
            'agb-frontend',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/js/frontend.js',
            array(),
            ADVANCED_GALLERY_BLOCK_VERSION,
            true
        );

        // Lightbox assets — registered here, conditionally enqueued in render_block().
        wp_register_script(
            'agb-lightbox',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/modules/lightbox/lightbox.js',
            array(),
            ADVANCED_GALLERY_BLOCK_VERSION,
            true
        );
        wp_register_style(
            'agb-lightbox',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/modules/lightbox/lightbox.css',
            array(),
            ADVANCED_GALLERY_BLOCK_VERSION
        );
    }

    /* ------------------------------------------------------------------
     * Server-side render callback
     * ----------------------------------------------------------------*/

    public function render_block( $attributes ) {
        $images = $attributes['images'] ?? array();
        if ( empty( $images ) ) {
            return is_admin()
                ? '<p>' . esc_html__( 'Select images for the gallery.', 'advanced-gallery-block' ) . '</p>'
                : '';
        }

        // --- Sanitize attributes ------------------------------------------------

        $hover_effect   = sanitize_key( $attributes['hoverEffect'] ?? 'none' );
        $animation      = sanitize_key( $attributes['animation'] ?? 'none' );
        $enable_lightbox = (bool) ( $attributes['enableLightbox'] ?? true );
        $lazy_load       = (bool) ( $attributes['lazyLoad'] ?? true );
        $show_captions   = (bool) ( $attributes['showCaptions'] ?? false );
        $aspect_ratio    = sanitize_text_field( $attributes['aspectRatio'] ?? 'auto' );
        $enable_masonry  = (bool) ( $attributes['enableMasonry'] ?? true );

        // Sanitize customClass — split on spaces, sanitize each token.
        $custom_class = '';
        if ( ! empty( $attributes['customClass'] ) ) {
            $custom_class = implode(
                ' ',
                array_map( 'sanitize_html_class', explode( ' ', $attributes['customClass'] ) )
            );
        }

        // Numeric values with safe bounds.
        $columns         = max( 1, intval( $attributes['columns'] ?? 3 ) );
        $columns_tablet  = max( 1, intval( $attributes['columnsTablet'] ?? 2 ) );
        $columns_mobile  = max( 1, intval( $attributes['columnsMobile'] ?? 1 ) );
        $gap             = max( 0, intval( $attributes['gap'] ?? 10 ) );
        $gap_mobile      = max( 0, intval( $attributes['gapMobile'] ?? 10 ) );
        $border_radius   = max( 0, intval( $attributes['borderRadius'] ?? 0 ) );
        $min_column_width = max( 100, intval( $attributes['minColumnWidth'] ?? 250 ) );

        // --- Enqueue assets conditionally --------------------------------------

        wp_enqueue_script( 'agb-frontend' );

        if ( $enable_lightbox ) {
            wp_enqueue_script( 'agb-lightbox' );
            wp_enqueue_style( 'agb-lightbox' );
        }

        // --- Build HTML --------------------------------------------------------

        $gallery_id = 'agb-gallery-' . uniqid();

        $classes = array( 'agb-gallery', 'agb-hover-' . $hover_effect, 'agb-animation-' . $animation );
        if ( $enable_masonry ) {
            $classes[] = 'agb-masonry';
        }
        if ( ! empty( $custom_class ) ) {
            $classes[] = $custom_class;
        }
        if ( $enable_lightbox ) {
            $classes[] = 'agb-lightbox-enabled';
        }

        $style_vars = array(
            '--agb-columns-desktop: '  . $columns,
            '--agb-columns-tablet: '   . $columns_tablet,
            '--agb-columns-mobile: '   . $columns_mobile,
            '--agb-gap-desktop: '      . $gap . 'px',
            '--agb-gap-mobile: '       . $gap_mobile . 'px',
            '--agb-border-radius: '    . $border_radius . 'px',
            '--agb-aspect-ratio: '     . esc_attr( $aspect_ratio ),
            '--agb-min-column-width: ' . $min_column_width . 'px',
        );

        $image_count = count( $images );

        ob_start();
        ?>
        <div id="<?php echo esc_attr( $gallery_id ); ?>"
             class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
             style="<?php echo esc_attr( implode( '; ', $style_vars ) ); ?>"
             role="region"
             aria-label="<?php esc_attr_e( 'Image gallery', 'advanced-gallery-block' ); ?>">
            <?php foreach ( $images as $index => $image ) :
                // Validate image data.
                if ( ! isset( $image['id'] ) || ! is_numeric( $image['id'] ) ) {
                    continue;
                }

                $img_id      = intval( $image['id'] );
                $img_full_url = wp_get_attachment_image_url( $img_id, 'full' );
                $img_alt      = get_post_meta( $img_id, '_wp_attachment_image_alt', true );
                $img_caption  = wp_get_attachment_caption( $img_id );

                if ( ! $img_full_url ) {
                    continue;
                }

                // Fallback alt text.
                if ( empty( $img_alt ) ) {
                    $img_alt = $img_caption
                        ? $img_caption
                        : sprintf( __( 'Gallery image %d', 'advanced-gallery-block' ), $index + 1 );
                }

                // Build image attributes — wp_get_attachment_image() generates
                // srcset, sizes, width, height automatically and is compatible
                // with image-optimization plugins (WebP/AVIF converters).
                //
                // First images (above the fold) get fetchpriority="high" and
                // eager loading to optimize LCP. The rest get lazy loading.
                $is_above_fold = $index < $columns;

                $img_attrs = array(
                    'class'   => 'agb-gallery-image',
                    'loading' => ( $lazy_load && ! $is_above_fold ) ? 'lazy' : 'eager',
                    'alt'     => $img_alt,
                );

                if ( $is_above_fold ) {
                    $img_attrs['fetchpriority'] = 'high';
                } elseif ( $lazy_load ) {
                    $img_attrs['decoding'] = 'async';
                }
                ?>
                <div class="agb-gallery-item"
                     data-index="<?php echo esc_attr( $index ); ?>"
                     role="group"
                     aria-label="<?php echo esc_attr( sprintf(
                         /* translators: 1: current image number, 2: total images */
                         __( 'Image %1$d of %2$d', 'advanced-gallery-block' ),
                         $index + 1,
                         $image_count
                     ) ); ?>">

                    <?php if ( $enable_lightbox ) : ?>
                        <a href="<?php echo esc_url( $img_full_url ); ?>"
                           class="agb-gallery-link"
                           data-lightbox="<?php echo esc_attr( $gallery_id ); ?>"
                           data-title="<?php echo esc_attr( $img_caption ); ?>"
                           aria-label="<?php echo esc_attr( sprintf(
                               /* translators: 1: image number, 2: image alt text */
                               __( 'Open image %1$d in lightbox: %2$s', 'advanced-gallery-block' ),
                               $index + 1,
                               $img_alt
                           ) ); ?>"
                           role="button">
                    <?php endif; ?>

                    <div class="agb-image-container">
                        <?php echo wp_get_attachment_image( $img_id, 'large', false, $img_attrs ); ?>
                        <?php if ( 'none' !== $hover_effect && $enable_lightbox ) : ?>
                            <div class="agb-hover-overlay">
                                <div class="agb-hover-content">
                                    <span class="agb-expand-icon" aria-hidden="true">&#x2922;</span>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>

                    <?php if ( $show_captions && $img_caption ) : ?>
                        <div class="agb-gallery-caption"><?php echo esc_html( $img_caption ); ?></div>
                    <?php endif; ?>

                    <?php if ( $enable_lightbox ) : ?></a><?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }
}
