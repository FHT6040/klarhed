<?php
/**
 * Plugin Name: KLARHED — Lederskabsforløb
 * Plugin URI:  https://frank-tessin.dk/klarhed
 * Description: Et komplet 8-moduls online-lederskabsforløb baseret på KLARHED-arbejdsbogen af Frank Tessin. Indeholder baseline-måling, refleksionsøvelser, dialogværktøjer, selvevalueringer, cases og en 90-dages plan.
 * Version:     1.2.7
 * Author:      Frank Tessin
 * Author URI:  https://frank.tessin.dk
 * Text Domain: klarhed
 * Domain Path: /languages
 * License:     GPLv2 or later
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'KLARHED_VERSION', '1.2.7' );
define( 'KLARHED_PATH', plugin_dir_path( __FILE__ ) );
define( 'KLARHED_URL',  plugin_dir_url( __FILE__ ) );

require_once KLARHED_PATH . 'includes/class-klarhed-course.php';
require_once KLARHED_PATH . 'includes/class-klarhed-progress.php';
require_once KLARHED_PATH . 'includes/class-klarhed-attempts.php';
require_once KLARHED_PATH . 'includes/class-klarhed-shares.php';
require_once KLARHED_PATH . 'includes/class-klarhed-shortcodes.php';
require_once KLARHED_PATH . 'includes/class-klarhed-admin.php';
require_once KLARHED_PATH . 'includes/class-klarhed-rest.php';
require_once KLARHED_PATH . 'includes/class-klarhed-emails.php';
require_once KLARHED_PATH . 'includes/class-klarhed-pdf.php';
require_once KLARHED_PATH . 'includes/class-klarhed-woo.php';

class Klarhed_Plugin {
    public function __construct() {
        add_action( 'init',                  [ $this, 'load_textdomain' ] );
        add_action( 'init',                  [ $this, 'register_sw_rewrite' ] );
        add_action( 'init',                  [ $this, 'maybe_flush_sw_rewrite' ] );
        add_action( 'wp_enqueue_scripts',    [ $this, 'enqueue_frontend' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin' ] );
        add_action( 'template_redirect',     [ $this, 'serve_sw' ] );
        add_filter( 'query_vars',            [ $this, 'add_query_vars' ] );
        register_activation_hook( __FILE__,   [ $this, 'activate' ] );
        register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );

        new Klarhed_Shortcodes();
        new Klarhed_Admin();
        new Klarhed_REST();
        new Klarhed_Attempts();
        new Klarhed_Shares();
        new Klarhed_Emails();
        new Klarhed_PDF();
        new Klarhed_Woo();
    }

    public function load_textdomain() {
        load_plugin_textdomain( 'klarhed', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    public function add_query_vars( $vars ) {
        $vars[] = 'klarhed_sw';
        return $vars;
    }

    public function register_sw_rewrite() {
        add_rewrite_rule( '^klarhed-sw\.js$', 'index.php?klarhed_sw=1', 'top' );
    }

    // Flush rewrite rules once per version so the SW rewrite takes effect without reactivation.
    public function maybe_flush_sw_rewrite() {
        if ( get_option( 'klarhed_sw_flushed' ) !== KLARHED_VERSION ) {
            flush_rewrite_rules();
            update_option( 'klarhed_sw_flushed', KLARHED_VERSION );
        }
    }

    public function serve_sw() {
        if ( ! get_query_var( 'klarhed_sw' ) ) return;
        $file = KLARHED_PATH . 'assets/sw.js';
        if ( ! file_exists( $file ) ) { status_header( 404 ); exit; }
        header( 'Content-Type: application/javascript; charset=utf-8' );
        header( 'Cache-Control: no-cache, no-store, must-revalidate' );
        header( 'Service-Worker-Allowed: /' );
        readfile( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
        exit;
    }

    public function enqueue_frontend() {
        wp_register_style( 'klarhed-fonts',
            'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap',
            [], null );
        wp_register_style( 'klarhed',
            KLARHED_URL . 'assets/css/klarhed.css',
            [ 'klarhed-fonts' ], KLARHED_VERSION );

        // Prefer the compiled wp-scripts bundle when present
        // wp-scripts names output after the entry filename (src/index.jsx → index.jsx.js)
        $asset_file = KLARHED_PATH . 'assets/build/index.jsx.asset.php';
        if ( ! file_exists( $asset_file ) ) {
            $asset_file = KLARHED_PATH . 'assets/build/index.asset.php'; // legacy name
        }
        if ( file_exists( $asset_file ) ) {
            $asset    = include $asset_file;
            $js_file  = file_exists( KLARHED_PATH . 'assets/build/index.jsx.js' )
                ? 'assets/build/index.jsx.js'
                : 'assets/build/index.js';
            wp_register_script( 'klarhed-app',
                KLARHED_URL . $js_file,
                $asset['dependencies'] ?? [ 'wp-element', 'wp-api-fetch' ],
                $asset['version'] ?? KLARHED_VERSION, true );
        } else {
            wp_register_script( 'klarhed-app',
                KLARHED_URL . 'assets/js/klarhed-app.js',
                [], KLARHED_VERSION, true );
        }

        wp_localize_script( 'klarhed-app', 'KLARHED_BOOT', [
            'restUrl'  => esc_url_raw( rest_url( 'klarhed/v1/' ) ),
            'nonce'    => wp_create_nonce( 'wp_rest' ),
            'user'     => is_user_logged_in() ? wp_get_current_user()->display_name : '',
            'loggedIn' => is_user_logged_in(),
            'course'   => Klarhed_Course::get_data(),
        ] );
    }

    public function enqueue_admin( $hook ) {
        wp_add_inline_style( 'common', '#adminmenu #toplevel_page_klarhed .wp-menu-image img{width:20px;height:20px}' );
        if ( strpos( $hook, 'klarhed' ) === false ) return;
        wp_enqueue_style( 'klarhed-admin', KLARHED_URL . 'assets/css/klarhed-admin.css', [], KLARHED_VERSION );
    }

    public function activate() {
        if ( false === get_option( 'klarhed_settings' ) ) {
            add_option( 'klarhed_settings', [
                'primary_color'   => '#B4E600',
                'secondary_color' => '#29C7C7',
                'require_login'   => true,
                'auto_save'       => true,
                'send_reminders'  => true,
            ] );
        }
        flush_rewrite_rules();
    }

    public function deactivate() {
        flush_rewrite_rules();
    }
}

new Klarhed_Plugin();
