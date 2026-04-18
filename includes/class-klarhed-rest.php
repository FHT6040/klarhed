<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * REST API — state + attempts + shares + enrollment.
 *
 * Base: /wp-json/klarhed/v1/
 *
 *   GET    /state                  current user's active-attempt state
 *   POST   /state                  autosave into active attempt
 *
 *   GET    /attempts               list all attempts for current user
 *   POST   /attempts               start a new attempt (archives the previous)
 *   GET    /attempts/<id>          fetch one
 *   PATCH  /attempts/<id>          rename
 *   DELETE /attempts/<id>          delete
 *   POST   /attempts/<id>/answers  partial save
 *   POST   /attempts/<id>/activate switch active
 *
 *   GET    /share                  current share config (+allowed flag)
 *   POST   /share                  update share config
 *   DELETE /share                  revoke
 *
 *   POST   /admin/coach-allow      (admin only) toggle per-user
 */
class Klarhed_REST {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register' ] );
    }

    public function register() {
        $ns = 'klarhed/v1';

        register_rest_route( $ns, '/course', [
            'methods'             => 'GET',
            'callback'            => fn() => rest_ensure_response( Klarhed_Course::get_data() ),
            'permission_callback' => '__return_true',
        ] );

        register_rest_route( $ns, '/state', [
            [ 'methods' => 'GET',  'callback' => [ $this, 'get_state' ],  'permission_callback' => [ $this, 'auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ $this, 'save_state' ], 'permission_callback' => [ $this, 'auth' ] ],
        ] );

        register_rest_route( $ns, '/attempts', [
            [ 'methods' => 'GET',  'callback' => [ $this, 'list_attempts' ], 'permission_callback' => [ $this, 'auth' ] ],
            [ 'methods' => 'POST', 'callback' => [ $this, 'create_attempt' ], 'permission_callback' => [ $this, 'auth' ] ],
        ] );
        register_rest_route( $ns, '/attempts/(?P<id>\d+)', [
            [ 'methods' => 'GET',    'callback' => [ $this, 'get_attempt' ],    'permission_callback' => [ $this, 'auth_attempt' ] ],
            [ 'methods' => 'PATCH',  'callback' => [ $this, 'rename_attempt' ], 'permission_callback' => [ $this, 'auth_attempt' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'delete_attempt' ], 'permission_callback' => [ $this, 'auth_attempt' ] ],
        ] );
        register_rest_route( $ns, '/attempts/(?P<id>\d+)/answers', [
            'methods' => 'POST', 'callback' => [ $this, 'save_answers' ], 'permission_callback' => [ $this, 'auth_attempt' ],
        ] );
        register_rest_route( $ns, '/attempts/(?P<id>\d+)/activate', [
            'methods' => 'POST', 'callback' => [ $this, 'activate_attempt' ], 'permission_callback' => [ $this, 'auth_attempt' ],
        ] );

        register_rest_route( $ns, '/share', [
            [ 'methods' => 'GET',    'callback' => [ $this, 'get_share' ],    'permission_callback' => [ $this, 'auth' ] ],
            [ 'methods' => 'POST',   'callback' => [ $this, 'save_share' ],   'permission_callback' => [ $this, 'auth' ] ],
            [ 'methods' => 'DELETE', 'callback' => [ $this, 'revoke_share' ], 'permission_callback' => [ $this, 'auth' ] ],
        ] );

        register_rest_route( $ns, '/admin/coach-allow', [
            'methods' => 'POST', 'callback' => [ $this, 'admin_toggle_coach' ],
            'permission_callback' => fn() => current_user_can( 'edit_users' ),
        ] );

        // Legacy single-state endpoints retained for back-compat
        register_rest_route( $ns, '/mark', [
            'methods' => 'POST', 'callback' => [ $this, 'mark' ], 'permission_callback' => [ $this, 'auth' ],
        ] );
    }

    /* ---------------------- auth helpers ---------------------- */

    public function auth() { return is_user_logged_in(); }

    public function auth_attempt( $request ) {
        if ( ! is_user_logged_in() ) return false;
        $p = get_post( (int) $request['id'] );
        if ( ! $p || $p->post_type !== Klarhed_Attempts::CPT ) return false;
        return (int) $p->post_author === get_current_user_id() || current_user_can( 'edit_users' );
    }

    /* ---------------------- state ---------------------- */

    public function get_state() {
        $uid = get_current_user_id();
        $active = Klarhed_Attempts::get_active_for_user( $uid );
        if ( ! $active ) {
            $new_id = Klarhed_Attempts::create_for_user( $uid, __( 'Mit første gennemløb', 'klarhed' ) );
            $active = Klarhed_Attempts::hydrate( get_post( $new_id ) );
        }
        return rest_ensure_response( $active );
    }

    public function save_state( WP_REST_Request $r ) {
        $uid = get_current_user_id();
        $active = Klarhed_Attempts::get_active_for_user( $uid );
        if ( ! $active ) return new WP_Error( 'no-active', 'No active attempt', [ 'status' => 404 ] );
        $res = Klarhed_Attempts::save_answers( $active['id'], (array) $r->get_json_params(), $uid );
        if ( is_wp_error( $res ) ) return $res;
        return rest_ensure_response( [ 'ok' => true ] );
    }

    /* ---------------------- attempts ---------------------- */

    public function list_attempts() {
        return rest_ensure_response( Klarhed_Attempts::get_for_user( get_current_user_id() ) );
    }

    public function create_attempt( WP_REST_Request $r ) {
        $name = sanitize_text_field( $r->get_param( 'name' ) );
        $id = Klarhed_Attempts::create_for_user( get_current_user_id(), $name );
        if ( is_wp_error( $id ) ) return $id;
        return rest_ensure_response( Klarhed_Attempts::hydrate( get_post( $id ) ) );
    }

    public function get_attempt( WP_REST_Request $r ) {
        return rest_ensure_response( Klarhed_Attempts::hydrate( get_post( (int) $r['id'] ) ) );
    }

    public function rename_attempt( WP_REST_Request $r ) {
        $name = sanitize_text_field( $r->get_param( 'name' ) );
        Klarhed_Attempts::rename( (int) $r['id'], $name, get_current_user_id() );
        return rest_ensure_response( [ 'ok' => true ] );
    }

    public function delete_attempt( WP_REST_Request $r ) {
        Klarhed_Attempts::delete( (int) $r['id'], get_current_user_id() );
        return rest_ensure_response( [ 'ok' => true ] );
    }

    public function save_answers( WP_REST_Request $r ) {
        $res = Klarhed_Attempts::save_answers( (int) $r['id'], (array) $r->get_json_params(), get_current_user_id() );
        if ( is_wp_error( $res ) ) return $res;
        return rest_ensure_response( [ 'ok' => true ] );
    }

    public function activate_attempt( WP_REST_Request $r ) {
        $uid = get_current_user_id();
        // archive current active, activate this one
        $active = Klarhed_Attempts::get_active_for_user( $uid );
        if ( $active && (int) $active['id'] !== (int) $r['id'] ) {
            update_post_meta( $active['id'], Klarhed_Attempts::META_STATUS, 'archived' );
            update_post_meta( $active['id'], Klarhed_Attempts::META_ARCHIVED, current_time( 'mysql', true ) );
        }
        update_post_meta( (int) $r['id'], Klarhed_Attempts::META_STATUS, 'active' );
        delete_post_meta( (int) $r['id'], Klarhed_Attempts::META_ARCHIVED );
        return rest_ensure_response( [ 'ok' => true ] );
    }

    /* ---------------------- share ---------------------- */

    public function get_share() {
        $uid = get_current_user_id();
        $s = Klarhed_Shares::get( $uid );
        $s['adminAllowed'] = Klarhed_Shares::admin_allowed( $uid );
        if ( ! empty( $s['enabled'] ) && ! empty( $s['token'] ) ) {
            $s['publicUrl'] = Klarhed_Shares::public_url( $s['token'] );
        }
        return rest_ensure_response( $s );
    }

    public function save_share( WP_REST_Request $r ) {
        $patch = (array) $r->get_json_params();
        $allowed = [ 'enabled' => true, 'scope' => true, 'selected' => true ];
        $patch = array_intersect_key( $patch, $allowed );
        if ( isset( $patch['scope'] ) && ! in_array( $patch['scope'], [ 'all', 'latest', 'selected' ], true ) ) {
            return new WP_Error( 'bad-scope', 'Invalid scope', [ 'status' => 400 ] );
        }
        $res = Klarhed_Shares::save( get_current_user_id(), $patch );
        if ( is_wp_error( $res ) ) return $res;
        if ( ! empty( $res['enabled'] ) && ! empty( $res['token'] ) ) {
            $res['publicUrl'] = Klarhed_Shares::public_url( $res['token'] );
        }
        return rest_ensure_response( $res );
    }

    public function revoke_share() {
        Klarhed_Shares::revoke( get_current_user_id() );
        return rest_ensure_response( [ 'ok' => true ] );
    }

    public function admin_toggle_coach( WP_REST_Request $r ) {
        $user_id = absint( $r->get_param( 'user_id' ) );
        if ( ! $user_id || ! get_userdata( $user_id ) ) {
            return new WP_Error( 'invalid-user', 'User not found', [ 'status' => 404 ] );
        }
        $allow = (bool) $r->get_param( 'allow' );
        Klarhed_Shares::set_admin_allowed( $user_id, $allow );
        return rest_ensure_response( [ 'ok' => true, 'user_id' => $user_id, 'allow' => $allow ] );
    }

    /* ---------------------- legacy ---------------------- */

    public function mark( WP_REST_Request $r ) {
        $slug = sanitize_key( $r->get_param( 'slug' ) );
        $idx  = (int) $r->get_param( 'lesson' );
        $uid  = get_current_user_id();
        $active = Klarhed_Attempts::get_active_for_user( $uid );
        if ( ! $active ) return new WP_Error( 'no-active', 'No active attempt', [ 'status' => 404 ] );
        Klarhed_Attempts::save_answers( $active['id'], [
            'progress' => [ $slug . ':' . $idx => true ],
        ], $uid );
        do_action( 'klarhed/lesson/completed', $uid, $slug, $active['id'] );
        return rest_ensure_response( [ 'ok' => true ] );
    }
}
