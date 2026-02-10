<?php
/**
 * Plugin Name: Advanced Gallery Block
 * Plugin URI: https://floriswebdesign.nl/
 * Description: Een geavanceerde galerij block voor Gutenberg met responsive instellingen, meerdere layouts en lightbox functionaliteit.
 * Version: 1.0.0
 * Author: FlorisWebDesign
 * Author URI: https://floriswebdesign.nl
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: advanced-gallery-block
 * Domain Path: /languages
 * Requires at least: 5.8
 * Tested up to: 6.7
 * Requires PHP: 7.4
 * Network: false
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
    exit( 'Direct access forbidden.' );
}

// Plugin constants.
define('ADVANCED_GALLERY_BLOCK_VERSION', '1.0.0');
define('ADVANCED_GALLERY_BLOCK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ADVANCED_GALLERY_BLOCK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADVANCED_GALLERY_BLOCK_PLUGIN_FILE', __FILE__);

// Load the main plugin class.
require_once ADVANCED_GALLERY_BLOCK_PLUGIN_DIR . 'includes/class-advanced-gallery-block.php';

// Initialize plugin.
function advanced_gallery_block_init() {
    return AdvancedGalleryBlock::get_instance();
}
add_action( 'plugins_loaded', 'advanced_gallery_block_init' );

// PHP version compatibility check.
if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
    add_action( 'admin_notices', function () {
        printf(
            '<div class="notice notice-error"><p>%s</p></div>',
            esc_html( sprintf(
                /* translators: %s: current PHP version */
                __( 'Advanced Gallery Block requires PHP 7.4 or higher. You are running version %s. Please update PHP.', 'advanced-gallery-block' ),
                PHP_VERSION
            ) )
        );
    } );
}