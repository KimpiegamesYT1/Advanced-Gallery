<?php

if (!defined('ABSPATH')) {
    exit('Direct access forbidden.');
}

class AdvancedGalleryBlock {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function __construct() {
        add_action('init', array($this, 'init'));
    }
    
    public function init() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        $this->register_block();
    }

    public function register_block() {
        register_block_type('advanced-gallery/gallery-block', array(
            'editor_script' => 'advanced-gallery-block-editor-script',
            'editor_style'  => 'advanced-gallery-block-editor-style',
            'style'         => 'advanced-gallery-block-style',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'images' => ['type' => 'array', 'default' => []],
                'columns' => ['type' => 'number', 'default' => 3],
                'columnsTablet' => ['type' => 'number', 'default' => 2],
                'columnsMobile' => ['type' => 'number', 'default' => 1],
                'gap' => ['type' => 'number', 'default' => 10],
                'gapMobile' => ['type' => 'number', 'default' => 10],
                'enableLightbox' => ['type' => 'boolean', 'default' => true],
                'showCaptions' => ['type' => 'boolean', 'default' => false],
                'hoverEffect' => ['type' => 'string', 'default' => 'none'],
                'lazyLoad' => ['type' => 'boolean', 'default' => true],
                'animation' => ['type' => 'string', 'default' => 'none'],
                'borderRadius' => ['type' => 'number', 'default' => 0],
                'customClass' => ['type' => 'string', 'default' => ''],
                'aspectRatio' => ['type' => 'string', 'default' => 'auto'],
                'minColumnWidth' => ['type' => 'number', 'default' => 250],
                'enableMasonry' => ['type' => 'boolean', 'default' => true]
            )
        ));

        // Registreer assets
        wp_register_style(
            'advanced-gallery-block-style',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/css/frontend.css',
            [],
            ADVANCED_GALLERY_BLOCK_VERSION
        );
        wp_register_style(
            'advanced-gallery-block-editor-style',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/css/editor.css',
            ['wp-edit-blocks'],
            ADVANCED_GALLERY_BLOCK_VERSION
        );
        wp_register_script(
            'advanced-gallery-block-editor-script',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/js/editor.js',
            ['wp-blocks', 'wp-element', 'wp-components', 'wp-i18n', 'wp-block-editor'],
            ADVANCED_GALLERY_BLOCK_VERSION,
            true
        );
    }

    public function render_block($attributes) {
        $images = $attributes['images'] ?? [];
        if (empty($images)) {
            return is_admin() ? '<p>Selecteer afbeeldingen voor de galerij.</p>' : '';
        }

        $hoverEffect = $attributes['hoverEffect'] ?? 'none';
        $animation = $attributes['animation'] ?? 'none';
        $customClass = $attributes['customClass'] ?? '';
        $enableLightbox = $attributes['enableLightbox'] ?? true;
        $lazyLoad = $attributes['lazyLoad'] ?? true;
        $showCaptions = $attributes['showCaptions'] ?? false;
        $aspectRatio = $attributes['aspectRatio'] ?? 'auto';
        $enableMasonry = $attributes['enableMasonry'] ?? true;

        // Ensure numeric values
        $columns = max(1, intval($attributes['columns'] ?? 3));
        $columnsTablet = max(1, intval($attributes['columnsTablet'] ?? 2));
        $columnsMobile = max(1, intval($attributes['columnsMobile'] ?? 1));
        $gap = max(0, intval($attributes['gap'] ?? 10));
        $gapMobile = max(0, intval($attributes['gapMobile'] ?? 10));
        $borderRadius = max(0, intval($attributes['borderRadius'] ?? 0));
        $minColumnWidth = max(100, intval($attributes['minColumnWidth'] ?? 250));

        $gallery_id = 'advanced-gallery-' . uniqid();
        
        $classes = ['advanced-gallery', 'hover-' . $hoverEffect, 'animation-' . $animation];
        if (!empty($customClass)) {
            $classes[] = $customClass;
        }
        if ($enableLightbox) {
            $classes[] = 'lightbox-enabled';
        }

        $style_vars = [
            '--columns-desktop: ' . $columns,
            '--columns-tablet: ' . $columnsTablet,
            '--columns-mobile: ' . $columnsMobile,
            '--gap-desktop: ' . $gap . 'px',
            '--gap-mobile: ' . $gapMobile . 'px',
            '--border-radius: ' . $borderRadius . 'px',
            '--aspect-ratio: ' . esc_attr($aspectRatio),
            '--min-column-width: ' . $minColumnWidth . 'px'
        ];

        ob_start();
        ?>
        <div id="<?php echo esc_attr($gallery_id); ?>" 
             class="<?php echo esc_attr(implode(' ', $classes)); ?>" 
             style="<?php echo esc_attr(implode('; ', $style_vars)); ?>"
             role="region"
             aria-label="<?php esc_attr_e('Image gallery', 'advanced-gallery-block'); ?>">
            <?php foreach ($images as $index => $image):
                $img_id = $image['id'];
                $img_url = wp_get_attachment_image_url($img_id, 'large');
                $img_full_url = wp_get_attachment_image_url($img_id, 'full');
                $img_alt = get_post_meta($img_id, '_wp_attachment_image_alt', true);
                $img_caption = wp_get_attachment_caption($img_id);
                
                // Ensure we have valid URLs
                if (!$img_url) continue;
                if (!$img_full_url) $img_full_url = $img_url;
                
                // Fallback alt text
                if (empty($img_alt)) {
                    $img_alt = $img_caption ?: sprintf(__('Gallery image %d', 'advanced-gallery-block'), $index + 1);
                }
                ?>
                <div class="gallery-item" data-index="<?php echo $index; ?>" role="group" aria-label="<?php echo esc_attr(sprintf(__('Image %d of %d', 'advanced-gallery-block'), $index + 1, count($images))); ?>">
                    <?php if ($enableLightbox): ?>
                        <a href="<?php echo esc_url($img_full_url); ?>" 
                           class="gallery-link" 
                           data-lightbox="<?php echo esc_attr($gallery_id); ?>" 
                           data-title="<?php echo esc_attr($img_caption); ?>"
                           aria-label="<?php echo esc_attr(sprintf(__('Open image %d in lightbox: %s', 'advanced-gallery-block'), $index + 1, $img_alt)); ?>"
                           role="button">
                    <?php endif; ?>
                    
                    <div class="image-container">
                        <img 
                            <?php if ($lazyLoad): ?>
                                data-src="<?php echo esc_url($img_url); ?>"
                                class="lazy"
                                loading="lazy"
                            <?php else: ?>
                                src="<?php echo esc_url($img_url); ?>"
                                loading="eager"
                            <?php endif; ?>
                            alt="<?php echo esc_attr($img_alt); ?>"
                        />
                        <?php if ($hoverEffect !== 'none' && $enableLightbox): ?>
                            <div class="hover-overlay">
                                <div class="hover-content">
                                    <span class="expand-icon">⤢</span>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <?php if ($showCaptions && $img_caption): ?>
                        <div class="gallery-caption"><?php echo esc_html($img_caption); ?></div>
                    <?php endif; ?>
                    
                    <?php if ($enableLightbox): ?></a><?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    public function enqueue_frontend_assets() {
        // Zorg ervoor dat jQuery wordt geladen
        wp_enqueue_script('jquery');
        
        // Voeg onze frontend script toe met jQuery als dependency
        wp_enqueue_script(
            'advanced-gallery-block-frontend-script',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/js/frontend.js',
            ['jquery'],
            ADVANCED_GALLERY_BLOCK_VERSION . '.' . time(), // Voorkom caching tijdens ontwikkeling
            true
        );

        // Voeg lightbox module script toe
        wp_enqueue_script(
            'advanced-gallery-block-lightbox-script',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/modules/lightbox/lightbox.js',
            ['jquery', 'advanced-gallery-block-frontend-script'],
            ADVANCED_GALLERY_BLOCK_VERSION . '.' . time(),
            true
        );

        // Voeg frontend styles toe
        wp_enqueue_style(
            'advanced-gallery-block-style',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/css/frontend.css',
            [],
            ADVANCED_GALLERY_BLOCK_VERSION . '.' . time() // Voorkom caching tijdens ontwikkeling
        );

        // Voeg lightbox module styles toe
        wp_enqueue_style(
            'advanced-gallery-block-lightbox-style',
            ADVANCED_GALLERY_BLOCK_PLUGIN_URL . 'assets/modules/lightbox/lightbox.css',
            ['advanced-gallery-block-style'],
            ADVANCED_GALLERY_BLOCK_VERSION . '.' . time()
        );
    }
}
