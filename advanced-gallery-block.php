<?php
/**
 * Plugin Name: Advanced Gallery Block
 * Plugin URI: https://floriswebdesign.nl/
 * Description: Een geavanceerde galerij block voor Gutenberg met responsive instellingen, meerdere layouts en lightbox.
 * Version: 2.0.0
 * Author: FlorisWebDesign
 * Author URI: https://floriswebdesign.nl
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: advanced-gallery-block
 * Requires at least: 5.8
 * Tested up to: 6.7
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'ADVANCED_GALLERY_BLOCK_VERSION', '2.0.0' );
define( 'ADVANCED_GALLERY_BLOCK_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ADVANCED_GALLERY_BLOCK_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once ADVANCED_GALLERY_BLOCK_PLUGIN_DIR . 'includes/class-advanced-gallery-block.php';

add_action( 'plugins_loaded', function () {
    AdvancedGalleryBlock::get_instance();
} );

if ( version_compare( PHP_VERSION, '7.4', '<' ) ) {
    add_action( 'admin_notices', function () {
        printf(
            '<div class="notice notice-error"><p>%s</p></div>',
            esc_html( sprintf( 'Advanced Gallery Block vereist PHP 7.4 of hoger. Je huidige versie is %s.', PHP_VERSION ) )
        );
    } );
}