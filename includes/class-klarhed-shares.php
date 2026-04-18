<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Klarhed_Shares — read-only coach-shares for a user's attempts.
 *
 * Admin-gated: the user can only create a share if the administrator has
 * enabled `klarhed_coach_sharing_allowed` on their user record.
 *
 * Each share is represented by a single row of user-meta on the owner:
 *   - enabled  : bool
 *   - token    : 32-char secret, used as the public URL slug
 *   - scope    : 'all' | 'latest' | 'selected'
 *   - selected : array of attempt post IDs
 *   - created  : mysql datetime
 *
 * The public-facing read view is registered as a rewrite at /klarhed/coach/<token>/.
 */
class Klarhed_Shares {

    const META_KEY     = '_klarhed_coach_share';
    const ALLOW_KEY    = 'klarhed_coach_sharing_allowed';
    const REWRITE_SLUG = 'klarhed/coach';

    public function __construct() {
        add_action( 'init',            [ $this, 'register_rewrite' ] );
        add_filter( 'query_vars',      [ $this, 'query_vars' ] );
        add_action( 'template_redirect', [ $this, 'maybe_render_coach_view' ] );
    }

    /* ---------------------- admin toggle ---------------------- */

    public static function admin_allowed( $user_id ) {
        return (bool) get_user_meta( $user_id, self::ALLOW_KEY, true );
    }

    public static function set_admin_allowed( $user_id, $allow ) {
        if ( ! current_user_can( 'edit_users' ) ) return false;
        update_user_meta( $user_id, self::ALLOW_KEY, $allow ? 1 : 0 );
        if ( ! $allow ) self::revoke( $user_id ); // turning off kills any live link
        return true;
    }

    /* ---------------------- share CRUD ---------------------- */

    public static function get( $user_id ) {
        $s = get_user_meta( $user_id, self::META_KEY, true );
        if ( ! is_array( $s ) ) $s = [];
        return wp_parse_args( $s, [
            'enabled'  => false,
            'token'    => '',
            'scope'    => 'latest',
            'selected' => [],
            'created'  => '',
        ] );
    }

    public static function save( $user_id, array $patch ) {
        if ( ! self::admin_allowed( $user_id ) ) {
            return new WP_Error( 'forbidden', __( 'Coach-deling er ikke tilladt for denne bruger.', 'klarhed' ), [ 'status' => 403 ] );
        }
        $s = self::get( $user_id );
        $s = array_merge( $s, $patch );
        if ( $s['enabled'] && empty( $s['token'] ) ) {
            $s['token']   = wp_generate_password( 32, false, false );
            $s['created'] = current_time( 'mysql', true );
        }
        update_user_meta( $user_id, self::META_KEY, $s );
        return $s;
    }

    public static function revoke( $user_id ) {
        update_user_meta( $user_id, self::META_KEY, [
            'enabled' => false, 'token' => '', 'scope' => 'latest', 'selected' => [], 'created' => '',
        ] );
    }

    public static function find_by_token( $token ) {
        if ( ! $token ) return null;
        $users = get_users( [
            'meta_key'   => self::META_KEY,
            'fields'     => [ 'ID' ],
            'number'     => 200,
        ] );
        foreach ( $users as $u ) {
            $s = self::get( $u->ID );
            if ( ! empty( $s['enabled'] ) && hash_equals( (string) $s['token'], (string) $token ) ) {
                return [ 'user_id' => (int) $u->ID, 'share' => $s ];
            }
        }
        return null;
    }

    public static function resolve_attempts( $user_id, $share ) {
        $all = Klarhed_Attempts::get_for_user( $user_id );
        switch ( $share['scope'] ) {
            case 'all':
                return $all;
            case 'latest':
                return $all ? [ end( $all ) ] : [];
            case 'selected':
                $ids = array_map( 'intval', (array) ( $share['selected'] ?? [] ) );
                return array_values( array_filter( $all, fn( $a ) => in_array( (int) $a['id'], $ids, true ) ) );
        }
        return [];
    }

    public static function public_url( $token ) {
        return home_url( '/' . self::REWRITE_SLUG . '/' . rawurlencode( $token ) . '/' );
    }

    /* ---------------------- public read view ---------------------- */

    public function register_rewrite() {
        add_rewrite_rule( '^' . self::REWRITE_SLUG . '/([^/]+)/?$', 'index.php?klarhed_coach_token=$matches[1]', 'top' );
    }

    public function query_vars( $vars ) { $vars[] = 'klarhed_coach_token'; return $vars; }

    public function maybe_render_coach_view() {
        $token = get_query_var( 'klarhed_coach_token' );
        if ( ! $token ) return;

        $found = self::find_by_token( $token );
        if ( ! $found ) { status_header( 404 ); nocache_headers(); include get_404_template(); exit; }

        $user     = get_userdata( $found['user_id'] );
        $attempts = self::resolve_attempts( $found['user_id'], $found['share'] );

        nocache_headers();
        header( 'X-Robots-Tag: noindex, nofollow', true );

        // Render a minimal coach view — wrapped by the theme header/footer for branding.
        get_header();
        echo '<main class="klarhed-coach-view">';
        printf( '<p class="klarhed-eyebrow">%s</p>', esc_html__( 'Coach-visning · kun læse-adgang', 'klarhed' ) );
        printf( '<h1>%s</h1>', esc_html( sprintf( __( '%s — KLARHED-forløb', 'klarhed' ), $user->display_name ) ) );
        echo do_shortcode( sprintf( '[klarhed_coach_attempts user="%d" ids="%s"]',
            (int) $found['user_id'],
            esc_attr( implode( ',', wp_list_pluck( $attempts, 'id' ) ) )
        ) );
        echo '</main>';
        get_footer();
        exit;
    }
}
