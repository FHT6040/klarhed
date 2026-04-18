<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Progress {
    const META_KEY = 'klarhed_state';

    public static function get( $user_id = null ) {
        $user_id = $user_id ?: get_current_user_id();
        if ( ! $user_id ) return [ 'progress' => [], 'fields' => [], 'baseline' => [], 'finalMeasure' => [] ];
        $state = get_user_meta( $user_id, self::META_KEY, true );
        if ( ! is_array( $state ) ) {
            $state = [ 'progress' => [], 'fields' => [], 'baseline' => [], 'finalMeasure' => [] ];
        }
        return $state;
    }

    public static function save( $state, $user_id = null ) {
        $user_id = $user_id ?: get_current_user_id();
        if ( ! $user_id ) return false;
        update_user_meta( $user_id, self::META_KEY, $state );
        return true;
    }

    public static function mark_lesson( $chapter_slug, $lesson_index, $user_id = null ) {
        $s = self::get( $user_id );
        $s['progress'][ $chapter_slug . ':' . (int) $lesson_index ] = true;
        self::save( $s, $user_id );
    }

    public static function completion_pct( $user_id = null ) {
        $s = self::get( $user_id );
        $total = Klarhed_Course::total_lessons();
        if ( $total === 0 ) return 0;
        $done = count( array_filter( $s['progress'] ?? [] ) );
        return (int) round( $done / $total * 100 );
    }
}
