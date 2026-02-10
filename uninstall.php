<?php
/**
 * Advanced Gallery Block — Uninstall
 *
 * Fires when the plugin is deleted via the WordPress admin.
 * Cleans up any options or transients stored by the plugin.
 *
 * @package AdvancedGalleryBlock
 */

// Abort if not called by WordPress.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Currently the plugin does not store options or custom tables.
// If future versions add settings, clean them up here:
// delete_option( 'advanced_gallery_block_settings' );
