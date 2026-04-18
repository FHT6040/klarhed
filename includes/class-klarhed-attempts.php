<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

/**
 * Klarhed_Attempts — one record per user "gennemløb" (course attempt).
 * Stored as a custom post type so each attempt has its own autosaved answers,
 * MQ baseline/finalMeasure, progress map, and timestamps.
 *
 * A user can have many attempts. Exactly one is marked `active` at a time;
 * the rest become `archived` when a new one is started.
 */
class Klarhed_Attempts {

    const CPT            = 'klarhed_attempt';
    const META_STATUS    = '_klarhed_status';     // 'active' | 'archived'
    const META_ANSWERS   = '_klarhed_answers';    // assoc array: progress, fields, baseline, finalMeasure
    const META_STARTED   = '_klarhed_started_at';
    const META_ARCHIVED  = '_klarhed_archived_at';

    public function __construct() {
        add_action( 'init', [ $this, 'register_cpt' ] );
    }

    public function register_cpt() {
        register_post_type( self::CPT, [
            'label'             => __( 'KLARHED-gennemløb', 'klarhed' ),
            'public'            => false,
            'show_ui'           => true,
            'show_in_menu'      => false,   // surfaced inside our own admin menu
            'show_in_rest'      => false,
            'supports'          => [ 'title', 'author' ],
            'capability_type'   => 'post',
            'map_meta_cap'      => true,
        ] );
    }

    /* ---------------------- queries ---------------------- */

    public static function get_for_user( $user_id ) {
        $q = new WP_Query( [
            'post_type'      => self::CPT,
            'author'         => (int) $user_id,
            'posts_per_page' => -1,
            'orderby'        => 'date',
            'order'          => 'ASC',
            'no_found_rows'  => true,
        ] );
        $out = [];
        foreach ( $q->posts as $p ) {
            $out[] = self::hydrate( $p );
        }
        return $out;
    }

    public static function get_active_for_user( $user_id ) {
        $list = self::get_for_user( $user_id );
        foreach ( $list as $a ) if ( $a['status'] === 'active' ) return $a;
        return $list ? end( $list ) : null;
    }

    public static function hydrate( WP_Post $p ) {
        $answers = get_post_meta( $p->ID, self::META_ANSWERS, true );
        if ( ! is_array( $answers ) ) $answers = [];
        return [
            'id'            => $p->ID,
            'name'          => $p->post_title,
            'status'        => get_post_meta( $p->ID, self::META_STATUS, true ) ?: 'active',
            'createdAt'     => mysql_to_rfc3339( $p->post_date_gmt ),
            'updatedAt'     => mysql_to_rfc3339( $p->post_modified_gmt ),
            'archivedAt'    => get_post_meta( $p->ID, self::META_ARCHIVED, true ),
            'progress'      => $answers['progress']     ?? (object) [],
            'fields'        => $answers['fields']       ?? (object) [],
            'baseline'      => $answers['baseline']     ?? (object) [],
            'finalMeasure'  => $answers['finalMeasure'] ?? (object) [],
        ];
    }

    /* ---------------------- mutations ---------------------- */

    public static function create_for_user( $user_id, $name = '' ) {
        // archive the current active one
        $active = self::get_active_for_user( $user_id );
        if ( $active ) {
            update_post_meta( $active['id'], self::META_STATUS, 'archived' );
            update_post_meta( $active['id'], self::META_ARCHIVED, current_time( 'mysql', true ) );
        }

        if ( ! $name ) {
            $name = sprintf( __( 'Gennemløb · %s', 'klarhed' ), date_i18n( 'M Y' ) );
        }

        $id = wp_insert_post( [
            'post_type'   => self::CPT,
            'post_status' => 'publish',
            'post_author' => (int) $user_id,
            'post_title'  => wp_strip_all_tags( $name ),
        ], true );
        if ( is_wp_error( $id ) ) return $id;

        update_post_meta( $id, self::META_STATUS,  'active' );
        update_post_meta( $id, self::META_STARTED, current_time( 'mysql', true ) );
        update_post_meta( $id, self::META_ANSWERS, [
            'progress' => [], 'fields' => [], 'baseline' => [], 'finalMeasure' => [],
        ] );

        do_action( 'klarhed/attempt/created', $id, $user_id );
        return $id;
    }

    public static function save_answers( $attempt_id, array $answers, $user_id ) {
        $p = get_post( $attempt_id );
        if ( ! $p || $p->post_type !== self::CPT ) return new WP_Error( 'nf', 'Not found', [ 'status' => 404 ] );
        if ( (int) $p->post_author !== (int) $user_id ) return new WP_Error( 'forbidden', 'Forbidden', [ 'status' => 403 ] );
        if ( get_post_meta( $p->ID, self::META_STATUS, true ) !== 'active' ) {
            return new WP_Error( 'locked', __( 'Dette gennemløb er arkiveret og kan ikke redigeres.', 'klarhed' ), [ 'status' => 409 ] );
        }
        $current = get_post_meta( $p->ID, self::META_ANSWERS, true );
        if ( ! is_array( $current ) ) $current = [];
        foreach ( [ 'progress', 'fields', 'baseline', 'finalMeasure' ] as $k ) {
            if ( isset( $answers[ $k ] ) && is_array( $answers[ $k ] ) ) {
                $current[ $k ] = array_merge( $current[ $k ] ?? [], $answers[ $k ] );
            }
        }
        update_post_meta( $p->ID, self::META_ANSWERS, $current );
        wp_update_post( [ 'ID' => $p->ID ] ); // bumps post_modified
        return true;
    }

    public static function rename( $attempt_id, $name, $user_id ) {
        $p = get_post( $attempt_id );
        if ( ! $p || (int) $p->post_author !== (int) $user_id ) return false;
        wp_update_post( [ 'ID' => $p->ID, 'post_title' => wp_strip_all_tags( $name ) ] );
        return true;
    }

    public static function delete( $attempt_id, $user_id ) {
        $p = get_post( $attempt_id );
        if ( ! $p || (int) $p->post_author !== (int) $user_id ) return false;
        wp_delete_post( $p->ID, true );
        return true;
    }

    public static function completion_pct( $attempt ) {
        $total = Klarhed_Course::total_lessons();
        if ( $total === 0 ) return 0;
        $done = count( array_filter( (array) $attempt['progress'] ) );
        return (int) round( $done / $total * 100 );
    }
}
