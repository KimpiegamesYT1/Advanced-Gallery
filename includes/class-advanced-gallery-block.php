<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class AdvancedGalleryBlock {

    private static $instance = null;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'init', array( $this, 'init' ) );
    }

    private function __clone() {}

    public function __wakeup() {
        throw new \Exception( 'Kan singleton niet unserialiseren.' );
    }

    public function init() {
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }
        $this->register_block();
    }

    public function register_block() {
        register_block_type(
            ADVANCED_GALLERY_BLOCK_PLUGIN_DIR,
            array( 'render_callback' => array( $this, 'render_block' ) )
        );

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

        wp_register_script(
            'agb-gallery',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/js/gallery.js',
            array(),
            ADVANCED_GALLERY_BLOCK_VERSION,
            true
        );
    }

    public function render_block( $attributes ) {
        $images = $attributes['images'] ?? array();
        if ( empty( $images ) || ! is_array( $images ) ) {
            return '';
        }

        $hover_effect   = sanitize_key( $attributes['hoverEffect'] ?? 'none' );
        $animation       = sanitize_key( $attributes['animation'] ?? 'none' );
        $enable_lightbox = (bool) ( $attributes['enableLightbox'] ?? true );
        $show_lightbox_title       = (bool) ( $attributes['showLightboxTitle'] ?? true );
        $show_lightbox_description = (bool) ( $attributes['showLightboxDescription'] ?? false );
        $show_captions   = (bool) ( $attributes['showCaptions'] ?? false );
        $enable_masonry  = (bool) ( $attributes['enableMasonry'] ?? true );

        $custom_class = '';
        if ( ! empty( $attributes['customClass'] ) ) {
            $custom_class = implode(
                ' ',
                array_map( 'sanitize_html_class', explode( ' ', $attributes['customClass'] ) )
            );
        }

        $columns        = min( 12, max( 1, intval( $attributes['columns'] ?? 3 ) ) );
        $columns_tablet = min( 8, max( 1, intval( $attributes['columnsTablet'] ?? 2 ) ) );
        $columns_mobile = min( 6, max( 1, intval( $attributes['columnsMobile'] ?? 1 ) ) );
        $gap            = min( 100, max( 0, intval( $attributes['gap'] ?? 10 ) ) );
        $gap_mobile     = min( 100, max( 0, intval( $attributes['gapMobile'] ?? 10 ) ) );
        $border_radius  = min( 200, max( 0, intval( $attributes['borderRadius'] ?? 0 ) ) );

        wp_enqueue_script( 'agb-gallery' );

        if ( $enable_lightbox ) {
            wp_enqueue_script( 'agb-lightbox' );
            wp_enqueue_style( 'agb-lightbox' );
        }

        $gallery_id = wp_unique_id( 'agb-gallery-' );

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
            '--agb-columns-desktop: ' . $columns,
            '--agb-columns-tablet: '  . $columns_tablet,
            '--agb-columns-mobile: '  . $columns_mobile,
            '--agb-gap-desktop: '     . $gap . 'px',
            '--agb-gap-mobile: '      . $gap_mobile . 'px',
            '--agb-border-radius: '   . $border_radius . 'px',
        );

        $ids = array();
        foreach ( $images as $image ) {
            if ( is_array( $image ) && isset( $image['id'] ) && is_numeric( $image['id'] ) ) {
                $ids[] = intval( $image['id'] );
            }
        }

        // Laad alle attachments en hun meta in één keer, in plaats van per afbeelding een query.
        if ( $ids && function_exists( '_prime_post_caches' ) ) {
            _prime_post_caches( $ids, false, true );
        }

        $need_caption     = $show_captions || $enable_lightbox;
        $need_description = $enable_lightbox && $show_lightbox_description;

        $items = array();
        foreach ( $ids as $img_id ) {
            $img_full_url = wp_get_attachment_image_url( $img_id, 'full' );
            if ( ! $img_full_url ) {
                continue;
            }

            $items[] = array(
                'id'          => $img_id,
                'full_url'    => $img_full_url,
                'alt'         => get_post_meta( $img_id, '_wp_attachment_image_alt', true ),
                'caption'     => $need_caption ? wp_get_attachment_caption( $img_id ) : '',
                'description' => $need_description
                    ? trim( wp_strip_all_tags( (string) get_post_field( 'post_content', $img_id ) ) )
                    : '',
            );
        }

        if ( empty( $items ) ) {
            return '';
        }

        $image_count = count( $items );

        ob_start();
        ?>
        <div id="<?php echo esc_attr( $gallery_id ); ?>"
             class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
             style="<?php echo esc_attr( implode( '; ', $style_vars ) ); ?>"
               data-lightbox-show-title="<?php echo $show_lightbox_title ? '1' : '0'; ?>"
               data-lightbox-show-description="<?php echo $show_lightbox_description ? '1' : '0'; ?>"
             role="region"
             aria-label="Afbeeldingen galerij">
            <?php foreach ( $items as $index => $item ) :
                $img_id          = $item['id'];
                $img_full_url    = $item['full_url'];
                $img_alt         = $item['alt'];
                $img_caption     = $item['caption'];
                $img_description = $item['description'];

                if ( empty( $img_alt ) ) {
                    $img_alt = $img_caption
                        ? $img_caption
                        : sprintf( 'Galerij afbeelding %d', $index + 1 );
                }

                $img_attrs = array(
                    'class' => 'agb-gallery-image',
                    'alt'   => $img_alt,
                );
                ?>
                <div class="agb-gallery-item"
                     data-index="<?php echo esc_attr( $index ); ?>"
                     role="group"
                     aria-label="<?php echo esc_attr( sprintf( 'Afbeelding %1$d van %2$d', $index + 1, $image_count ) ); ?>">

                    <?php if ( $enable_lightbox ) : ?>
                        <a href="<?php echo esc_url( $img_full_url ); ?>"
                           class="agb-gallery-link"
                           data-lightbox="<?php echo esc_attr( $gallery_id ); ?>"
                           data-title="<?php echo esc_attr( $img_caption ); ?>"
                           <?php if ( '' !== $img_description ) : ?>data-description="<?php echo esc_attr( $img_description ); ?>"<?php endif; ?>
                           aria-label="<?php echo esc_attr( sprintf( 'Open afbeelding %1$d in lightbox: %2$s', $index + 1, $img_alt ) ); ?>"
                           role="button">
                    <?php endif; ?>

                    <div class="agb-image-container">
                        <?php echo wp_get_attachment_image( $img_id, 'large', false, $img_attrs ); ?>
                        <?php if ( 'none' !== $hover_effect ) : ?>
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
