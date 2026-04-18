<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Klarhed_Course {
    private static $data = null;

    public static function get_data() {
        if ( self::$data !== null ) return self::$data;
        $json = file_get_contents( KLARHED_PATH . 'data/course.json' );
        self::$data = json_decode( $json, true );
        return self::$data;
    }

    public static function get_chapter( $slug ) {
        $data = self::get_data();
        foreach ( $data['chapters'] as $c ) {
            if ( $c['slug'] === $slug ) return $c;
        }
        return null;
    }

    public static function total_lessons() {
        $data = self::get_data();
        $n = 0;
        foreach ( $data['chapters'] as $c ) { $n += count( $c['lessons'] ); }
        return $n;
    }
}
