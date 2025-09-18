<?php
/**
 * Plugin Name: Advanced Gallery Block
 * Plugin URI: https://example.com/advanced-gallery-block
 * Description: Een geavanceerde galerij block voor Gutenberg met responsive instellingen, meerdere layouts en lightbox functionaliteit.
 * Version: 1.0.0
 * Author: Fabian Eppens
 * Author URI: https://example.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: advanced-gallery-block
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.3
 * Requires PHP: 7.4
 * Network: false
 */

// Voorkom directe toegang
if (!defined('ABSPATH')) {
    exit('Direct access forbidden.');
}

// Plugin constanten
define('ADVANCED_GALLERY_BLOCK_VERSION', '1.0.0');
define('ADVANCED_GALLERY_BLOCK_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ADVANCED_GALLERY_BLOCK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ADVANCED_GALLERY_BLOCK_PLUGIN_FILE', __FILE__);

// Laad de hoofdklasse van de plugin
require_once ADVANCED_GALLERY_BLOCK_PLUGIN_DIR . 'includes/class-advanced-gallery-block.php';

// Initialize plugin
function advanced_gallery_block_init() {
    return AdvancedGalleryBlock::get_instance();
}
add_action('plugins_loaded', 'advanced_gallery_block_init');

// Plugin compatibility check
if (version_compare(PHP_VERSION, '7.4', '<')) {
    add_action('admin_notices', function() {
        echo '<div class="notice notice-error"><p>';
        echo sprintf(
            __('Advanced Gallery Block requires PHP version 7.4 or higher. You are running version %s. Please update PHP.', 'advanced-gallery-block'),
            PHP_VERSION
        );
        echo '</p></div>';
    });
}